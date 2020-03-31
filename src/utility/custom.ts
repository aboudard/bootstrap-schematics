import {
  Rule,
  Tree,
  SchematicContext,
  SchematicsException
} from "@angular-devkit/schematics";
import { NodePackageInstallTask } from "@angular-devkit/schematics/tasks";
import { WorkspaceProject } from "@angular-devkit/core/src/experimental/workspace";
import { createSourceFile, ScriptTarget } from "typescript";

export function installDependencies(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.addTask(new NodePackageInstallTask());
    context.logger.debug("✅️ Dependencies installed");
    return tree;
  };
}

export function getProjectTargetOptions(
  project: WorkspaceProject,
  buildTarget: string
) {
  if (
    project.targets &&
    project.targets[buildTarget] &&
    project.targets[buildTarget].options
  ) {
    return project.targets[buildTarget].options;
  }

  if (
    project.architect &&
    project.architect[buildTarget] &&
    project.architect[buildTarget].options
  ) {
    return project.architect[buildTarget].options;
  }

  throw new SchematicsException(
    `Cannot determine project target configuration for: ${buildTarget}.`
  );
}

export function getSourceFile(host: Tree, path: string) {
  const buffer = host.read(path);
  if (!buffer) {
    throw new SchematicsException(`Could not find ${path}.`);
  }
  const content = buffer.toString('utf-8');
  return createSourceFile(path, content, ScriptTarget.Latest, true);
}