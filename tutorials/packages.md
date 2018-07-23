## Guides

- [Getting-Started](https://github.com/worldsibu/convector/blob/develop/tutorials/getting-started.md)
- [A typical starter project](https://github.com/worldsibu/convector/blob/develop/tutorials/starter-project.md)
- [Packages](https://github.com/worldsibu/convector/blob/develop/tutorials/packages.md)
- [Models](https://github.com/worldsibu/convector/blob/develop/tutorials/models.md)
- [Controllers](https://github.com/worldsibu/convector/blob/develop/tutorials/controllers.md)
- [ChaincodeManger](https://github.com/worldsibu/convector/blob/develop/tutorials/chaincode-manager.md)
- [DevEnv](https://github.com/worldsibu/convector/blob/develop/tutorials/dev-env.md)

# Packages

![npm](https://img.shields.io/npm/v/@worldsibu/convector-core-chaincode.svg)


Here's the official list of Convector packages:

## Core
---
- [@worldsibu/convector-core-model](https://www.npmjs.com/package/@worldsibu/convector-core-model) - The base model and decorators
- [@worldsibu/convector-core-storage](https://www.npmjs.com/package/@worldsibu/convector-core-storage) - The base storage for models
- [@worldsibu/convector-core-controller](https://www.npmjs.com/package/@worldsibu/convector-core-controller) - The base controller and decorators
- [@worldsibu/convector-core-adapter](https://www.npmjs.com/package/@worldsibu/convector-core-adapter) - The base adapter for controllers
- [@worldsibu/convector-core-chaincode](https://www.npmjs.com/package/@worldsibu/convector-core-chaincode) - The base chaincode to mount controllers on top
- [@worldsibu/convector-core-errors](https://www.npmjs.com/package/@worldsibu/convector-core-errors) - The core errors

## Adapters
---
- [@worldsibu/convector-adapter-mock](https://www.npmjs.com/package/@worldsibu/convector-adapter-mock) - A controller adapter for unit testing
- [@worldsibu/convector-adapter-fabric](https://www.npmjs.com/package/@worldsibu/convector-adapter-fabric) - A controller adapter for hyperledger fabric

## Storage
---
- [@worldsibu/convector-storage-stub](https://www.npmjs.com/package/@worldsibu/convector-storage-stub) - A fabric stub storage for models communication with the blockchain
- [@worldsibu/convector-storage-couchdb](https://www.npmjs.com/package/@worldsibu/convector-storage-couchdb) - A couchdb storage for models communication with a database

## Tools
---
- [@worldsibu/convector-tool-dev-env](https://www.npmjs.com/package/@worldsibu/convector-tool-dev-env) - A dev environment ready with 2 organizations, 3 users each, one peer, 2 CAs and 1 orderer
- [@worldsibu/convector-tool-chaincode-manager](https://www.npmjs.com/package/@worldsibu/convector-tool-chaincode-manager) - A tool to pack and deploy chaincodes using convector

## Common
---
- [@worldsibu/convector-common-fabric-helper](https://www.npmjs.com/package/@worldsibu/convector-common-fabric-helper) - A library to interact with hyperledger fabric. Meant for internal use but can help you with your application as well

----
----

Created with <span style="color: red;">♥</span> by [WorldSibu](http://worldsibu.com/)

[![Issues](https://img.shields.io/github/issues-raw/@worldsibu/convector.svg)](https://github.com/worldsibu/convector/issues)
[![Newsletter](https://img.shields.io/badge/Newsletter--orange.svg)](https://worldsibu.io/subscribe/)
[![Discord](https://img.shields.io/discord/469152206638284800.svg)](https://discord.gg/twRwpWt)

[![npm](https://img.shields.io/npm/v/@worldsibu/convector-core-chaincode.svg)](https://www.npmjs.com/package/@worldsibu/convector-core-chaincode)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
