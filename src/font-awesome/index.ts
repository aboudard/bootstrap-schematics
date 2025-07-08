import { Rule, SchematicContext, Tree, chain, externalSchematic, mergeWith, apply, url, move } from '@angular-devkit/schematics';


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function fontAwesome(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    return chain([
      addFontAwesome(_options.project),
    ])(tree, _context);
  };
}

/**
 * Do not specify version since it's in the local package.json file
 * Force package to free-solid and init a service with this package
 * @param project : ng project that schematics run on
 */
function addFontAwesome(project: string): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.debug("Adding fontawesome files");
    return chain([
      externalSchematic('@fortawesome/angular-fontawesome', 'ng-add', {
        project: project,
        iconPackages: ['free-solid']
      }),
      mergeWith(apply(url("./files"), [move("./src/app/shared/services")]))
    ])(
      tree,
      context
    );
  };
}