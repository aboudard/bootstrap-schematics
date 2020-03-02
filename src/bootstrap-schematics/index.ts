import { Rule, SchematicContext, Tree, chain, mergeWith, apply, url, move, SchematicsException } from '@angular-devkit/schematics';
import { Observable, concat, of } from "rxjs";
import { concatMap, map } from "rxjs/operators";
import { NodePackageInstallTask } from "@angular-devkit/schematics/tasks";
import { getLatestNodeVersion, NodePackage, parseJsonAtPath } from '../utility/util';
import { NodeDependencyType, addPackageJsonDependency } from '../utility/dependencies';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function bootstrapSchematics(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    console.log(_options);
    return chain([
      updateDependencies(),
      installDependencies(),
      addBootstrapFiles(),
      modifyAngularJson()
    ])(tree, _context);
  };
}

function updateDependencies(): Rule {
  // let removeDependencies: Observable<Tree>;
  return (tree: Tree, context: SchematicContext): Observable<Tree> => {
    context.logger.debug("Updating dependencies...");
    context.addTask(new NodePackageInstallTask());
    const addDependencies = of(
      "bootstrap",
      "@ng-bootstrap/ng-bootstrap"
    ).pipe(
      concatMap((packageName: string) => getLatestNodeVersion(packageName)),
      map((packageFromRegistry: NodePackage) => {
        const { name, version } = packageFromRegistry;
        context.logger.debug(
          `Adding ${name}:${version} to ${NodeDependencyType.Dev}`
        );

        addPackageJsonDependency(tree, {
          type: NodeDependencyType.Dev,
          name,
          version
        });

        return tree;
      })
    );
    return concat(addDependencies);
  }
}

function installDependencies(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    _context.addTask(new NodePackageInstallTask());
    _context.logger.debug('✅️ Dependencies installed');
    return tree;
  };
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

function getAngularJsonValue(tree: Tree) {
  const angularJsonAst = parseJsonAtPath(tree, "./angular.json");
  return angularJsonAst.value as any;
}

function getProject(angularJsonValue: any) {
  return angularJsonValue.defaultProject;
}

function modifyAngularJson(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (tree.exists("./angular.json")) {
      const angularJsonVal = getAngularJsonValue(tree);
      const project = getProject(angularJsonVal);
      const projectStylesOptionsJson = angularJsonVal["projects"][project]["architect"]["build"]["options"];
      const projectStylesTestJson = angularJsonVal["projects"][project]["architect"]["test"]["options"];
      const styles = [
        "src/assets/vendor.scss"
      ];
      projectStylesOptionsJson["styles"] = styles;
      projectStylesTestJson["styles"] = styles;

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
