import { Rule, SchematicContext, Tree, chain } from '@angular-devkit/schematics';
import { Observable, concat, of } from "rxjs";
import { concatMap, map } from "rxjs/operators";
import { NodePackageInstallTask } from "@angular-devkit/schematics/tasks";
import { getLatestNodeVersion, NodePackage } from '../utility/util';
import { NodeDependencyType, addPackageJsonDependency } from '../utility/dependencies';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function bootstrapSchematics(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    console.log(_options);
    return chain([
      updateDependencies(),
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
