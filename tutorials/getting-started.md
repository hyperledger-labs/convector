## Guides

- [Getting-Started](https://github.com/worldsibu/convector/blob/develop/tutorials/getting-started.md)
- [A typical starter project](https://github.com/worldsibu/convector/blob/develop/tutorials/starter-project.md)
- [Packages](https://github.com/worldsibu/convector/blob/develop/tutorials/packages.md)
- [Models](https://github.com/worldsibu/convector/blob/develop/tutorials/models.md)
- [Controllers](https://github.com/worldsibu/convector/blob/develop/tutorials/controllers.md)
- [ChaincodeManger](https://github.com/worldsibu/convector/blob/develop/tutorials/chaincode-manager.md)
- [DevEnv](https://github.com/worldsibu/convector/blob/develop/tutorials/dev-env.md)

# Getting Started with Convector

## Requirements

To start developing chaincodes with Convector, you need to first meet some basic requirements:

- You need NodeJS 8.11.0 (other versions might work, but this is the one we use for development)
- You need [Docker Community Edition](https://www.docker.com/community-edition)

Internally we use [Lerna](https://github.com/lerna/lerna) for our projects, and we advice you to do the same, since you'll be working with different npm modules in the same project, although this is totally optional.

We also recommend the use of [npx](https://github.com/zkat/npx) to avoid global dependencies. So this will be your only global dependency. Try `npm i -g npx`.

Create a folder and `cd` into it. Run `npx lerna init`. Fill the blanks.

Create a folder with the structure of your preferences, you can try `./packages/@your-username/your-chaincode-name`. Start a new npm project here: `npm init`.

Add some basic dependencies so you can get started:

```json
"@worldsibu/convector-core-controller": "1.0.0",
"@worldsibu/convector-core-model": "1.0.0",
"reflect-metadata": "0.1.12",
```

## Folder Structure

Inside your module folder you can create the folder structure of your preferences, but we suggest this one:

```
./src
./tests
./package.json
./README.md
```

## Develop

Create the [[Controllers]] and [[Models]] necessary for your application, checkout each guide to learn how to do so.

## Unit Tests

We strongly suggest you create a unit tests for your controllers, since it's the easiest way to test their logic. Refer to the guides to learn more about unit testing.

### Tests on Environments

When you're ready to test on a real chaincode, you can add our tools for development only

```
"@worldsibu/convector-adapter-mock": "1.0.0",
"@worldsibu/convector-tool-chaincode-manager": "1.0.0",
"@worldsibu/convector-tool-dev-env": "1.0.0",
```

We provide a development environment for you to easily run the chaincodes. All the following scripts can be invoked from the path `./node_modules/@worldsibu/convector-tool-dev-env/scripts/*`:

- **start.sh** - Download the Fabric Docker containers, creates 2 users and creates a channel (blockchain)
- **restart.sh** - Delete all the generated artifacts and start the environment again
- **stop.sh** - Just stop the docker containers

Then you can install the chaincodes by using the chaincode manager. Refer to the [[ChaincodeManger]] guide, but in short, running `chaincode-manager --config ./chaincode.config.json install <chaincode's name here> <put a version number here>`.
After installing a chaincode you can do 2 things:

- `chaincode-manager --config ./chaincode.config.json upgrade <chaincode name> <next version number>`
- `chaincode-manager --config ./chaincode.config.json invoke --user <username> <chaincode name> <controller name> <function name> [...args]` - By default, the dev environment has 2 users, admin and user1

----
----

Created with <span style="color: red;">♥</span> by [WorldSibu](http://worldsibu.com/)

[![Issues](https://img.shields.io/github/issues-raw/@worldsibu/convector.svg)](https://github.com/worldsibu/convector/issues)
[![Newsletter](https://img.shields.io/badge/Newsletter--orange.svg)](https://worldsibu.io/subscribe/)
[![Discord](https://img.shields.io/discord/469152206638284800.svg)](https://discord.gg/twRwpWt)

[![npm](https://img.shields.io/npm/v/@worldsibu/convector-core-chaincode.svg)](https://www.npmjs.com/package/@worldsibu/convector-core-chaincode)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
