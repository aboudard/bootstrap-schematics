import {
  Rule,
  SchematicContext,
  Tree,
  chain
} from "@angular-devkit/schematics";
import { NodePackageInstallTask } from "@angular-devkit/schematics/tasks";
import {
  addPackageJsonDependency,
  NodeDependencyType
} from "../utility/dependencies";
import { ngxSpinnerVersion } from "./versions";
import { getWorkspace } from "@schematics/angular/utility/config";
import { getAppModulePath } from "@schematics/angular/utility/ng-ast-utils";
import { getSourceFile, getProjectTargetOptions } from "../utility/custom";
import { addImportToModule } from "@schematics/angular/utility/ast-utils";
import { InsertChange } from "@schematics/angular/utility/change";
import * as cheerio from "cheerio";

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function spinner(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    return chain([
      updateDependencies(),
      addModule(_options.project),
      addComponent()
    ])(tree, _context);
  };
}

function addComponent(): Rule {
  return (tree: Tree) => {
    const filePath = "./src/app/app.component.html";
    const content: Buffer | null = tree.read(filePath);
    let strContent: string = "";
    if (content) strContent = content.toString("utf8");
    const $ = cheerio.load(strContent, {});
    console.log(strContent);
    const contentToInsert = `
    <ngx-spinner bdColor = "rgba(51, 51, 51, 0.8)"
    size = "medium"
    color = "#01afec"
    type = "ball-clip-rotate"></ngx-spinner>`;
    $.root().append(contentToInsert);
    console.log($.html())
    tree.overwrite(filePath, $.html());
    return tree;
  };
}

function updateDependencies(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.debug("Updating dependencies...");
    context.addTask(new NodePackageInstallTask());

    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Default,
      name: "ngx-spinner",
      version: ngxSpinnerVersion
    });

    return tree;
  };
}

function addModule(projectName?: string): Rule {
  return (tree: Tree) => {
    const workspace = getWorkspace(tree);
    const project =
      workspace.projects[projectName || workspace.defaultProject!];
    const buildOptions = getProjectTargetOptions(project, "build");
    const modulePath = getAppModulePath(tree, buildOptions.main);
    const moduleSource = getSourceFile(tree, modulePath);
    const changes = addImportToModule(
      moduleSource,
      modulePath,
      "NgxSpinnerModule",
      "ngx-spinner"
    );
    const recorder = tree.beginUpdate(modulePath);
    changes.forEach(change => {
      if (change instanceof InsertChange) {
        recorder.insertLeft(change.pos, change.toAdd);
      }
    });
    tree.commitUpdate(recorder);

    return tree;
  };
}
