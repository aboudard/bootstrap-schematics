import { NodePackageInstallTask, RunSchematicTask } from "@angular-devkit/schematics/tasks";
import { parseJsonAtPath } from '../utility/util';
import { NodeDependencyType, addPackageJsonDependency } from '../utility/dependencies';
import { bootstrapVersion, ngBootstrapVersion, ngLocalizeVersion } from './versions';
import { Schema } from './schema';
import { Rule, SchematicContext, Tree, chain, noop, mergeWith, apply, url, move, SchematicsException, template, Source, forEach } from '@angular-devkit/schematics';
import { InsertChange } from '@schematics/angular/utility/change';
import { getWorkspace } from '@schematics/angular/utility/config';
import { getAppModulePath } from '@schematics/angular/utility/ng-ast-utils';
import { addImportToModule } from '@schematics/angular/utility/ast-utils';
import { installDependencies, getProjectTargetOptions, getSourceFile } from "../utility/custom";

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function bootstrapSchematics(_options: Schema): Rule {

  let angularJsonVal;
  let project;

  return (tree: Tree, _context: SchematicContext) => {
    angularJsonVal = getAngularJsonValue(tree);
    project = getProject(angularJsonVal);

    return chain([
      _options.installFontAwesome ? addIcones(_options) : noop(),
      updateDependencies(),
      addSpinner(_options),
      installDependencies(),
      _options.removeStyles ? removeCssFiles() : noop(),
      _options.replaceAppTemplate ? addComponents(_options) : noop(),
      addBootstrapFiles(),
      modifyAngularJson(_options, angularJsonVal, project),
      addModule(_options.project),
    ])(tree, _context);
  };
}


function addSpinner(options: Schema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    // this tells the schematic to run the spinner schematic found in collection.json as a task
    _context.addTask(new RunSchematicTask('spinner', options));
    return tree;
  };
}

function addIcones(options: Schema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    // this tells the schematic to run the font-awesome schematic found in collection.json as a task
    _context.addTask(new RunSchematicTask('font-awesome', options));
    return tree;
  };
}


function addModule(projectName?: string): Rule {
  return (tree: Tree) => {
    const workspace = getWorkspace(tree);
    const project = workspace.projects[projectName || workspace.defaultProject!];
    const buildOptions = getProjectTargetOptions(project, 'build');
    const modulePath = getAppModulePath(tree, buildOptions.main);
    const moduleSource = getSourceFile(tree, modulePath);
    const changes = addImportToModule(
      moduleSource,
      modulePath,
      'CompModule',
      './comp/comp.module'
    );
    const recorder = tree.beginUpdate(modulePath);
    changes.forEach((change) => {
      if (change instanceof InsertChange) {
        recorder.insertLeft(change.pos, change.toAdd);
      }
    });
    tree.commitUpdate(recorder);

    return tree;
  }
}

function removeCssFiles(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.debug("Removing styles default file");
    if (tree.exists("./src/styles.scss")) {
      tree.delete("./src/styles.scss");
    }
    if (tree.exists("./src/styles.css")) {
      tree.delete("./src/styles.css");
    }
  }
}

function updateDependencies(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.debug("Updating dependencies...");
    context.addTask(new NodePackageInstallTask());

    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Default,
      name: 'bootstrap',
      version: bootstrapVersion,
    });

    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Default,
      name: '@ng-bootstrap/ng-bootstrap',
      version: ngBootstrapVersion,
    });

    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Default,
      name: '@angular/localize',
      version: ngLocalizeVersion,
    });

    return tree;
  }
}

function addBootstrapFiles(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.debug("Adding bootstrap files");
    return chain([
      mergeWith(apply(url("./assets"), [move("./src/assets")])),
      mergeWith(apply(url("./icon"), [move("./")]))
    ])(
      tree,
      context
    );
  };
}

function getAngularJsonValue(tree: Tree): any {
  const angularJsonAst = parseJsonAtPath(tree, "./angular.json");
  return angularJsonAst.value as any;
}

function getProject(angularJsonValue: any): string {
  return angularJsonValue.defaultProject;
}

function modifyAngularJson(options: Schema, angularJsonVal: any, project: string): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (tree.exists("./angular.json")) {
      // const angularJsonVal = getAngularJsonValue(tree);
      // const project = getProject(angularJsonVal);
      const projectStylesOptionsJson = angularJsonVal["projects"][project]["architect"]["build"]["options"];
      const projectStylesTestJson = angularJsonVal["projects"][project]["architect"]["test"]["options"];
      const styles = [
        "src/assets/vendor.scss", "src/assets/main.scss"
      ];
      if (options.removeStyles) {
        projectStylesOptionsJson["styles"] = styles;
        projectStylesTestJson["styles"] = styles;
      } else {
        Array.prototype.push.apply(projectStylesOptionsJson["styles"], styles);
        Array.prototype.push.apply(projectStylesTestJson["styles"], styles);
      }

      context.logger.debug(
        `Adding bootstrap scss override in angular.json style`
      );

      return tree.overwrite(
        "./angular.json",
        JSON.stringify(angularJsonVal, null, 2)
      );

    } else {
      throw new SchematicsException("angular.json not found");
    }
  }
}

function addComponents(_options: Schema): Rule {
  return () => {
    const rule =
      applyWithOverwrite(url('./files'), [
        template({
          ..._options,
        }),
      ]);
    return rule;
  };
}

function applyWithOverwrite(source: Source, rules: Rule[]): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const rule = mergeWith(
      apply(source, [
        ...rules,
        forEach((fileEntry) => {
          if (tree.exists(fileEntry.path)) {
            tree.overwrite(fileEntry.path, fileEntry.content);
            return null;
          }
          return fileEntry;
        }),

      ]),
    );

    return rule(tree, _context);
  };
}

