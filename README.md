# migrate-yfiles-ts-app

# **DEPRECATED:** This migration tool is deprecated, as [migrate-yfiles-app](https://github.com/yWorks/migrate-yfiles-app) supports TypeScript files as well now.

Tool that helps with the migration of typescript files that reference old yFiles for HTML API.

# Usage
Install via
```shell
$ npm install -g migrate-yfiles-ts-app
```

then run

```shell
$ migrate-yfiles-ts-app --project path/to/tsconfig.json [--fix --out out/path]
```

## Options
* ```--project```: Path to the project's ```tsconfig.json``` (default: ```./tsconfig.json```)
* ```--fix``` The tool is able to perform some transformations on its own. Enable to make 
  use of this feature (default: disabled).
* ```--out/-o```: If you don't want the tool to apply changes in-place you can specify a 
  separate out path (default: ```./```).

## Tests
In order to run the tests put the yFiles type definition file of yFiles for HTML 1.3 in the root folder.
  
# About
This tool is built on top of [TSLint](https://palantir.github.io/tslint/) and adds some custom 
rules which detect API changes. If your IDE natively supports TSLint you might as well add
those custom rules to your TSLint settings instead of running this tool from console. Have a
look at ```tslint.json``` for available rules.

# License
MIT
