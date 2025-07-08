# Angular Schematics for Bootstrap

List of tools to add Bootstrap to an Angular project with @ng-bootstrap/ng-bootstrap and basic scss override. It does write in angular.json config file and can remove the default styles.css file. Can also run Font Awesome install.

## Dependencies

You need global install of Typescript and tslint
```bash
npm install tslint typescript -g
```


## Using Shematics

- Create a new project with Angular CLI
- Simply add the package
```bash
ng add @aboudard/bootstrap-schematics
```
- Eventually remove the current package

### List of options

- removeStyles : When true, removes the default syles.css in root folder
- replaceAppTemplate : When true, replaces the app.component and adds other classic bootstrap components
- installFontAwesome : When true, installs font awesome and minimal config

### Option Font Awesome

- If you choose this option, just call, where needed, the service method under /shared/services/utils.service. It does use free-solid icon package by default, and adds faCheck icon via the library.
```js
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {
  faCheck
} from '@fortawesome/free-solid-svg-icons';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  constructor(private faIconLibrary: FaIconLibrary) { }
  initFaIcons(): void {
    this.faIconLibrary.addIcons(
      faCheck
    );
  }
}
```

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
 