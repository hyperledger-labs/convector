# Convector Framework

Convector is a framework designed to be used by javascript developers which aims to develop in Hyperledger Fabric fast and easily.

## Contents
The framework is made of different blocks, described below:

### Convector Core
Formed by all the `@worldsibu/convector-core-*` packages. It provides all the necessary code to write contract specifications using the *Model/Controller* pattern.

### Convector Storage
Convector is designed thinking in a modular design from its conception. A model not only can be used at the chaincode layer, since most of the time you'll have to use the same model in your services or front-end application, the models can be used anywhere. The difference of its behavior is the **storage** layer it uses. At chaincode the storage is the _Fabric Shim_ to save and read data in the blockchain. But if you whish to run a model in a NodeJS backend, the storage layer can be swapped by the CouchDB storage layer, which will allow you to read data, but not write. In a browser environment you can even create your own storage layer mapping to your back-end api.

### Convector Adapters
Following the modular design pattern from models, controllers have **adapters**, they are the handlers to route the requests to the appropriate layer. In a blockchain it will be the Fabric API, but on NodeJS it might be the _Fabric Client SDK_, on unit tests it might be a mock class, and on browser it can map to your APIs.

### Convector Tools
Formed by all the `@worldsibu/convector-tool-*` packages. It provides a set of helpers and utilitarians to make the chaincode development easily.

- **Chaincode Manager** used to bundle controllers in a single chaincode and handle the installation and invokation.
- **Dev Environment** _coming soon_, is a basic dev environment created with Fabric running on docker or vagrant. Contains one organization and one user in that organization, one channel, one orderer, one peer with its database, and all the cryptographic material for this to work.

## Model / Controller pattern
Convector is designed to write reusable pieces of code that describe the nature of what a developer can do in a blockchain. 

A blockchain (for the developer's eyes) is no more than a data layer protected by a logic layer defining the rules of what the outside world can do in with the inner data. Thus, a really comfortable way of writing chaincode logic (_smart contracts_) is by having **Models** describing the shape of the data and **Controllers** describing the actions and rules that apply to the models.
