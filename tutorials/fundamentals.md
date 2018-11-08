# Architecture overview

**Model/Controller pattern.** Convector is designed to help you write reusable pieces of code that describe the nature of what a developer can do in a blockchain. A blockchain, in the developer’s eyes, is no more than a data layer protected by a logic layer defining the rules of what the outside world can do in with the inner data. Thus, a really comfortable way of writing chaincode logic (smart contracts) is by having Models describing the shape of the data and Controllers describing the actions and rules that apply to the models.

Convector has been built taking in consideration the best out of the modern architectural design landscape. Its modular approach aims to accompany you through the whole development cycle, whether through its **Core Components** or the already existing **Convector Tools**.

You usually focus the most on the Specification, a.k.a models and controllers, to make sure they do what the network expects them to do. A blockchain (for the developer's eyes) is no more than a data layer protected by a logic layer defining the rules of what the outside world can do in with the inner data. Thus, a really comfortable way of writing chaincode logic (_smart contracts_) is by having **Models** describing the shape of the data and **Controllers** describing the actions and rules that apply to the models.

* *Models* are real world objects or concepts (like a token, a cryptocurrency, a contract, a car, a container, a user...) with specific characteristics (like a name, a owner, a deadline...) that you structure for your project.
* *Controllers* are real world actions acting over objects (models). E.g.: build a car, transferring ownership, reporting an accident. It's the business logic of your sysem.


You can then include that project at any layer of your application, from the blockchain to the front end. You only need to specify the corresponding adapter and storage containing the functions implementations and storage target of that layer. For example, to test, you may include a mock storage to see if your blockchain logic works before deploying it.

By using the built-in storages and adapters, most of the basics are covered. For example, saving to the blockchain validating the wallet (certificate) submitting the transaction, or calling the blockchain peers.

## Convector Core

All the `@worldsibu/convector-core-*` packages. It provides all the necessary code to write contract specifications using the *Model/Controller* pattern.

### Convector Storage

Convector is designed thinking in a modular design from its conception. A model not only can be used at the chaincode layer, since most of the time you'll have to use the same model in your services or front-end application, the models can be used anywhere. The difference of its behavior is the **storage** layer it uses. At chaincode the storage is the _Fabric Shim_ to save and read data in the blockchain. But if you whish to run a model in a NodeJS backend, the storage layer can be swapped by the CouchDB storage layer, which will allow you to read data, but not write. In a browser environment you can even create your own storage layer mapping to your back-end api.

> An *Storage* is the basic data layer of your entity (Model) which defines where the object will be stored (added, updated, removed).

### Convector Adapters

Following the modular design pattern from models, controllers have **adapters**, they are the handlers to route the requests to the appropriate layer. In a blockchain it will be the Fabric API, but on NodeJS it might be the _Fabric Client SDK_, on unit tests it might be a mock class, and on browser it can map to your APIs.

> You may think of *Adapters* as the specific logic. It varies based on the layer you are using the code.

## Convector Tools

All the `@worldsibu/convector-tool-*` packages. They provide a set of helpers and utils to make the chaincode development easier.

### Chaincode Manager

Used to bundle controllers in a single chaincode and handle the installation and invokation.

### Dev Environment

It's a basic dev environment created with Fabric running on docker or vagrant. Contains two organization and three users in that organization, two channels, one orderer, one peer per org with its database, and all the cryptographic material for this to work.

## A high level view

A typical distribution and usage of the components goes as follow (asumming you have a [mono-repo](https://danluu.com/monorepo/), if not, then distribute according to the **"Why-column"** which explains what that package installation will give you):

| Project/Layer | Why | Command |
| --- | --- | --- |
| Root of your project | To have a dev env and the utility that will let you install, upgrade, invoke and so on, the chaincodes. | `npm install -D @worldsibu/convector-tool-{dev-env,chaincode-manager}` |
| Root chaincode project. E.g.: chaincodes/ | So that you can share settings between your multiple chaincodes, such as development environment, tests and testing scripts, blockchain installation setup (what to install, where), etc. | `npm install -D @worldsibu/convector-{adapter-mock,tool-{dev-env,chaincode-manager}} chai mocha @types/chai @types/mocha ts-node` |
| At for each of your chaincode projects. E.g.: chaincodes/cc-token | Each chaincode can be a separate project so that you don't have to carry everything when including in another layer of your stack. |  `npm install -SE @worldsibu/convector-core-{model,controller} && npm i -S yup reflect-metadata && npm i -D @types/yup` |
| At your backend / api | It typically calls the nodes (peers) of your blockchain, but it may call the World State or other services as well. |  Include each of your chaincode projects, they will carry the basic dependencies `npm install -SE @worldsibu/convector-{adapter-fabric,storage-couchdb} @types/bytebuffer` |
| At the front end | Here you may be calling your backend/api server, it is great to have the interfaces and structures coming right from the chaincodes layer so that you don't have to copy everything. |  Include each of your chaincode projects, they will carry the basic dependencies. |

---

## What's next

* [Packages](https://github.com/worldsibu/convector/blob/develop/tutorials/packages.md)
* [Models](https://github.com/worldsibu/convector/blob/develop/tutorials/models.md)
* [Controllers](https://github.com/worldsibu/convector/blob/develop/tutorials/controllers.md)
* [Chaincode Manger](https://github.com/worldsibu/convector/blob/develop/tutorials/chaincode-manager.md)
* [Development Environment](https://github.com/worldsibu/convector/blob/develop/tutorials/dev-env.md)

----

## Relevant references

* [Quickstart](https://github.com/worldsibu/convector/blob/develop/tutorials/getting-started.md)
* [Dev resources in our blog](https://medium.com/worldsibu/for-devs/home)
* [A fullstack TypeScript project showcasing Convector](https://github.com/worldsibu/convector-example-drug-supply-chain)
* [A bootstrap project for you](https://github.com/worldsibu/convector-boilerplate)
