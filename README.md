# Angular Schematics for Bootstrap

List of tools to add Bootstrap to an Angular project with @ng-bootstrap/ng-bootstrap and basic scss override. It does write in angular.json config file and can remove the default styles.css file.

## Using Shematics

- Create a new project with Angular CLI
- Simply add the package
```bash
ng add @aboudard/bootstrap-schematics
```
- Eventually remove the current package

### Testing

To test locally, install `@angular-devkit/schematics-cli` globally and use the `schematics` command line tool. That tool acts the same as the `generate` command of the Angular CLI, but also has a debug mode.

Check the documentation with
```bash
schematics --help
```

Run these tasks locally to see the results of schematics in the sandbox app :
```bash
npm run build
npm run link:schematic
npm run test
```
Or run without app tests :
```bash
npm run buildschematics
```

### Unit Testing

`npm run test` will run the unit tests, using Jasmine as a runner and test framework.

### Publishing

To publish, simply do:

```bash
npm run build
npm publish
```

That's it!
 