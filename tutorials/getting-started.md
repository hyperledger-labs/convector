# Getting Started with Convector

## Prerequisites

* [Node](https://nodejs.org/en/download/) 8.11.0 (other versions might work, but this is the one we use for development)
* [Docker](https://www.docker.com/community-edition)

### In your NodeJS project

* [yup](https://www.npmjs.com/package/yup)
* [reflect-metadata](https://www.npmjs.com/package/reflect-metadata)

Internally we use [Lerna](https://github.com/lerna/lerna) for our projects, and we advice you to do the same, since you'll be working with different npm modules in the same project, although this is totally optional.

We also recommend the use of [npx](https://github.com/zkat/npx) to avoid global dependencies. So this will be your only global dependency. Try `npm i -g npx`.

## Structure

Create a folder and `cd` into it. Run `npx lerna init`. Lerna will create the following structure.

```
./packages/
./lerna.json
./package.json
```

Inside that `packages` folder, create your a folder with your chaincode's name. 

```bash
./packages/<chaincode-name>
```

There you will put all of your chaincode's code. Start a new npm project inside that folder `npm init`. Fill the blanks.

Add some basic dependencies so you can get started:

```bash
npm install -SE @worldsibu/convector-core-{model,controller} && npm i -SE reflect-metadata yup
```

## Folder Structure

Inside your chaincode folder you can create the folder structure of your preferences. We suggest the following.

```
./src
./tests
./package.json
./README.md
```

Just `mkdir src && mkdir tests`.

## Code your smart contracts

Create the [[Controllers]] and [[Models]] necessary for your application, checkout each guide to learn how to do so and more details.

Some basic structure can look like.

`./packages/<chaincode-name>/src/test.controller.ts`

```typescript
import {
  Controller,
  ConvectorController,
  Invokable,
  Param
} from '@worldsibu/convector-core-controller';

import { Test } from './test.model';

@Controller('test')
export class TestController extends ConvectorController {
  @Invokable()
  public async create(
    @Param(Test)
    test: Test
  ) {
    await test.save();
  }
}
```

`./packages/<chaincode-name>/src/test.model.ts`

```typescript
import * as yup from 'yup';
import {
  ConvectorModel,
  Default,
  ReadOnly,
  Required,
  Validate
} from '@worldsibu/convector-core-model';

export class Test extends ConvectorModel<Test> {
  @ReadOnly()
  @Required()
  public readonly type = 'io.worldsibu.test';

  @Required()
  @Validate(yup.string())
  public name: string;

  @ReadOnly()
  @Required()
  @Validate(yup.number())
  public created: number;

  @Required()
  @Validate(yup.number())
  public modified: number;
}
```

Bootstrap this structure with `touch ./packages/<chaincode-name>/src/<chaincode-name>.model.ts && touch ./packages/<chaincode-name>/src/<chaincode-name>.controller.ts`.

### Dependencies for TypeScript to work correctly

Now that you start bringing code to life you will need a few extra `tsconfig.json` files, so that the decorators can be recognized.

```
./tsconfig.json
./packages/<chaincode-name>/tsconfig.json
```

And include these contents respectively.

```json
{
    "compilerOptions": {
        "target": "es5",
        "module": "commonjs",
        "declaration": true,
        "sourceMap": true,
        "importHelpers": true,
        "experimentalDecorators": true,
        "removeComments": true,
        "lib": [
            "es2015"
        ],
        "outDir": "./dist",
        "rootDir": "./src"
    }
}
```

```json
{
    "extends": "../../tsconfig.json",
    "compilerOptions": {
        "outDir": "./dist",
        "rootDir": "."
    },
    "include": [
        "./src/**/*"
    ]
}
```

It will also be a good idea to install the following dev dependencies.

#### In your root `./package.json`

```json
"devDependencies": {
  "@types/chai": "^4.0.4",
  "@types/mocha": "^2.2.43",
  "@types/node": "^10.3.2",
  "chai": "^4.1.2",
  "mocha": "^5.0.3",
  "rimraf": "^2.6.2",
  "ts-node": "^6.0.3",
  "typescript": "^2.8.3"
  }
```


#### In your `./packages/<chaincode-name>/package.json` folder

```json
"devDependencies": {
  "chai": "^4.1.2",
  "mocha": "^5.0.3",
  "rimraf": "^2.6.2",
  "ts-node": "^6.0.3",
  "typescript": "^2.8.3",
}
```

## Unit Tests

We strongly suggest you create a unit tests for your controllers, since it's the easiest way to test their logic. Refer to the guides to learn more about unit testing.

During development you *don't* really need a blockchain. The logic you put in your chaincodes is no more than simple programming logic, so you can mock things up (we help with this) and define unit tests that execute in a virtual environment instead of an actual blockchain.

## Take your code to the blockchain

When you're ready to test on a real chaincode, you can add our Convector Tools. `dev-env` will create a *development* blockchain in your computer. **Make sure to do it at the root project folder, not inside `./packages/<chaincode-name>`**.

```bash
npm install -D @worldsibu/convector-{adapter-mock,tool-{dev-env,chaincode-manager}} fabric-client@1.1.2 fabric-ca-client@1.1.2
```

This Convector Tool setups a development environment for you to easily run the chaincodes. All the following scripts can be invoked from the path `./node_modules/@worldsibu/convector-tool-dev-env/scripts/*`:

To make it easier for you, add in your **root** `package.json` the following scripts. **Make sure to do it at the root project folder, NOT inside `./packages/<chaincode-name>/package.json`**.

```json
{
  "scripts":{
    "env:restart": "./node_modules/@worldsibu/convector-tool-dev-env/scripts/restart.sh",
    "env:clean": "./node_modules/@worldsibu/convector-tool-dev-env/scripts/clean.sh"
  }
}
```

Now you can manage your development blockchain straight from simple commands. Try running `npm run env:restart` to kickstart a blockchain in your comnputer.

Let's break this commands down.

| Command | What it does |
|--|--|
| `env:clean` | Cleans everything up |
| `env:restart` | Install a whole blockchain from scratch, it will create a folder in the root `.convector-dev-env` with all of the crypto materials you will need, as well it will start a set of containers you can explore by doing `docker ps`. |

The basic setup is explained in [[Development-Environment]].

After having your blockchain setup you will need to do some tasks with your chaincode, like installing it.

### Chaincode manipulation

By using the chaincode manager you can install and upgrade chaincodes in the blockchain. Refer to the [[Chaincode-Manager]] guide since you will need to first bootstrap some blockchain profiles to define some details about the topology of your blockchain and your chaincode.

----

## Single script to bootstrap the structure

We are working on bringing to life a CLI like Angular's. Would you like to help the community by collaborating on that project? <a href="https://discord.gg/twRwpWt" target="_blank">Join the discord</a> but for now, a workaround is to use this script to bootstrap a basic project structure.

First run:

```bash
PRJ=<replace-this-for-your-project-name>
```

After defining your project's name, run:

```bash
npm i -g npx && mkdir $PRJ && cd $PRJ && npx lerna init && cd packages && mkdir $PRJ-cc && cd $PRJ-cc && npm init --y && npm install -SE @worldsibu/convector-core-{model,controller} && npm i -SE reflect-metadata yup && mkdir src && mkdir tests && touch ./src/$PRJ.model.ts && touch ./src/$PRJ.controller.ts && cd .. && cd .. && npm install -D @worldsibu/convector-{adapter-mock,tool-{dev-env,chaincode-manager}} fabric-client@1.1.2 fabric-ca-client@1.1.2
```

----

## Relevant references

* [[Fundamentals]]
* [Dev resources in our blog](https://medium.com/worldsibu/for-devs/home)
* [A fullstack TypeScript project showcasing Convector](https://github.com/worldsibu/convector-example-drug-supply-chain)
* [A bootstrap project for you](https://github.com/worldsibu/convector-boilerplate)
