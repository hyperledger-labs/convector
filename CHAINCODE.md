# Tellus Chaincode

This repository contains all the Tellus chaincode specific code. It uses Convector, a Sibu proprietary framework to work with chaincodes based on controllers and models. All packages with prefix `chaincode-*` are part of Convector and planned to be migrated out of this repo.

## Convector Features

- Chaincode manager to allow installations, upgrade and invocation of chaincodes
- Controller based chaincodes, making them modular and composable based on a configuration file
- Agnostic models, making it possible to use them from any other platform using dependency injection for the storage layer
- Useful decorators for models, checking the structure and validating the required arguments

## Getting started

### Pre requisites

- Install the latest version of [nodejs](https://nodejs.org/en/) (the code was created using 8.11.1) and make sure _npm_ was also installed
- Install _npx_, a tool to avoid global npm packages and invoke npm binaries directly from your _node_modules_ folder, by running `npm i -g npx`
- Run `npm i` on the project's root

### Development

The project is made of multiple small npm modules than can be used individually. We use [lerna](https://github.com/lerna/lerna) to manage the modules and the publication to the npm registry. Those modules and be found in the `./convector`, `./controllers` and `./models` folders, each subfolder is a different module with its `package.json` file.

### Folder structure

- `./models` - contains all the application models, which are different classes containing only properties and inheriting the base model
- `./controllers` - contains all the business logic acting over the models and enforcing the necessary policies
- `./convector` - contains the Convector framework logic, this is the chaincode manager, base model, storage layer and error handling code

### Relevant lerna commands

- `npx lerna bootstrap` - resolve all the internal and external dependencies of the packages, building each module and creating symbolic links between local dependencies
- `npx lerna add [@worldsibu/]<dependency> [--dev] [--scope @worldsibu/<internal module>]` - this is the way we install internal (prefixed with `@worldsibu/`) or external packages in our modules. *Do not use npm install* since that can mess up the local dependencies. If you need to install a dependency just in one module, use the `--scope` flag to indicate which is the target module. For local devDependencies that don't produce binaries, you can install them in the root `package.json` using `npm i -D <dependency>`, this will make it available to all the internal modules
- `npx lerna run <npm script> [--scope @worldsibu/<internal module>]` - run an npm script (declared in a internal package.json). If the scope flag is omitted and the script name is found in multiple projects, it will be run on every module in parallel
- `npx lerna publish` - check for changes on each package and prompts for a patch, minor or major version to publish on npm and tag it on git
- For mor scripts, check the lerna [commands](https://github.com/lerna/lerna#commands) documentation
