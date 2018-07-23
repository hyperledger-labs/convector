# CONVECTOR

[![Issues](https://img.shields.io/github/issues-raw/@worldsibu/convector.svg)](https://github.com/worldsibu/convector/issues)
[![Newsletter](https://img.shields.io/badge/Newsletter--orange.svg)](https://worldsibu.io/subscribe/)
[![npm](https://img.shields.io/npm/v/@worldsibu/convector-core-chaincode.svg)](https://www.npmjs.com/package/@worldsibu/convector-core-chaincode)
[![Discord](https://img.shields.io/discord/469152206638284800.svg)](https://discord.gg/twRwpWt)

[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)


----

## Using Convector

Dependencies that you need in your project:

* [Node](https://nodejs.org/en/download/)
* [Docker](http://hyperledger-fabric.readthedocs.io/en/release-1.2/install.html)
* [yup](https://www.npmjs.com/package/yup)
* [reflect-metadata](https://www.npmjs.com/package/reflect-metadata)

Then include to your projects the Convector components depending on the layer you are working on.

A typical distribution and usage of the components goes as follow (asumming you have a mono-repo, if not, then distribute according to the "why" column which explains what that package installation will give you):

| Project/Layer | Why | Command |
| --- | --- | --- |
| Root of your project | To have a dev env and the utility that will let you install, upgrade, invoke and so on, the chaincodes. | `npm install -D @worldsibu/convector-tool-{dev-env,chaincode-manager}` |
| Root chaincode project. E.g.: chaincodes/ | So that you can share settings between your multiple chaincodes, such as development environment, tests and testing scripts, blockchain installation setup (what to install, where), etc. | `npm install -D @worldsibu/convector-{adapter-mock,tool-{dev-env,chaincode-manager}} chai mocha @types/chai @types/mocha ts-node` |
| At for each of your chaincode projects. E.g.: chaincodes/cc-token | Each chaincode can be a separate project so that you don't have to carry everything when including in another layer of your stack. |  `npm install -SE @worldsibu/convector-core-{model,controller} && npm i -S yup reflect-metadata && npm i -D @types/yup` |
| At your backend / api | It typically calls the nodes (peers) of your blockchain, but it may call the World State or other services as well. |  Include each of your chaincode projects, they will carry the basic dependencies `npm install -SE @worldsibu/convector-{adapter-fabric,storage-couchdb} @types/bytebuffer` |
| At the front end | Here you may be calling your backend/api server, it is great to have the interfaces and structures coming right from the chaincodes layer so that you don't have to copy everything. |  Include each of your chaincode projects, they will carry the basic dependencies. |

[If you want to see this distribution in action see this project! It is also a easy way for you to start a new project](https://github.com/worldsibu/convector-example-drug-supply-chain)

## Guides

- [Getting-Started](https://github.com/worldsibu/convector/blob/develop/tutorials/getting-started.md)
- [Packages](https://github.com/worldsibu/convector/blob/develop/tutorials/packages.md)
- [Models](https://github.com/worldsibu/convector/blob/develop/tutorials/models.md)
- [Controllers](https://github.com/worldsibu/convector/blob/develop/tutorials/controllers.md)
- [Chaincode Manger](https://github.com/worldsibu/convector/blob/develop/tutorials/chaincode-manager.md)
- [Development Environment](https://github.com/worldsibu/convector/blob/develop/tutorials/dev-env.md)



## About Convector
Convector is a framework designed to be used by javascript developers that aim to develop in Hyperledger Fabric (for now, more support on other technologies coming) fast and easily.
The framework is made up of different blocks, described below:

### Convector Core
Formed by all the `@worldsibu/convector-core-*` packages. It provides all the necessary code to write contract specifications using the *Model/Controller* pattern.

### Convector Storage
Convector is designed thinking in a modular design from its conception. A model not only can be used at the chaincode layer, since most of the time you'll have to use the same model in your services or front-end application, the models can be used anywhere. The difference of its behavior is the **storage** layer it uses. At chaincode the storage is the _Fabric Shim_ to save and read data in the blockchain. But if you whish to run a model in a NodeJS backend, the storage layer can be swapped by the CouchDB storage layer, which will allow you to read data, but not write. In a browser environment you can even create your own storage layer mapping to your back-end api.

### Convector Adapters
Following the modular design pattern from models, controllers have **adapters**, they are the handlers to route the requests to the appropriate layer. In a blockchain it will be the Fabric API, but on NodeJS it might be the _Fabric Client SDK_, on unit tests it might be a mock class, and on browser it can map to your APIs.

### Convector Tools
Formed by all the `@worldsibu/convector-tool-*` packages. It provides a set of helpers and utilitarians to make the chaincode development easily.

- **Chaincode Manager** used to bundle controllers in a single chaincode and handle the installation and invokation.
- **Dev Environment**, is a basic dev environment created with Fabric running on docker or vagrant. Contains two organization and three users in that organization, two channels, one orderer, one peer per org with its database, and all the cryptographic material for this to work.

## Model / Controller pattern
Convector is designed to write reusable pieces of code that describe the nature of what a developer can do in a blockchain. 

A blockchain (for the developer's eyes) is no more than a data layer protected by a logic layer defining the rules of what the outside world can do in with the inner data. Thus, a really comfortable way of writing chaincode logic (_smart contracts_) is by having **Models** describing the shape of the data and **Controllers** describing the actions and rules that apply to the models.

## More

* [Want to see how to create a ERC-20 compatible token on a permissioned blockchain?](https://github.com/worldsibu/convector-example-token)
* [Creating a project from scratch with Convector](https://github.com/worldsibu/convector-example-marketplace)
* [Creating a fullstack-project from scratch with Convector](https://github.com/worldsibu/convector-example-drug-supply-chain)
* About the creators: [WorldSibu](https://worldsibu.io)

## Support

* Don't hesitate to include recommendations, feature requests or bugs in our [issues section](https://github.com/worldsibu/convector/issues).
* To keep up with advances and news on Convector subscribe to our [Newsletter](https://worldsibu.io/subscribe/)
* If you need help and chat with our team, join our [Discord](https://discord.gg/twRwpWt)
