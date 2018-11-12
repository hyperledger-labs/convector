# Basic concepts about Hyperledger Fabric

We highly recommend that if you are just getting started with Fabric you reference to the official documentation <a href="https://hyperledger-fabric.readthedocs.io/en/release-1.3/key_concepts.html" target="_blank">here</a>. 

Here's our "Hyperledger Fabric Components in a Nutshell".

## Relevant Services

A Hyperledger Fabric network is not more than some software componentes connected with each other (peers container, also know as nodes), a service in charge of making sure the consensus and other communication matters work (orderering service, represented as a group of container), some cryptographic materials and services that allow for organizations to have control over their resources (Certificate Authorities - in this example emulated) and the blockchain, which is made up of Smart Contracts (also referred to as chaincodes) and the ledger (the underlying distributed database). There are other advanced concepts, but for development matters, those are the relevant ones.

## Chaincode Runtime

**Smart Contracts** or **Chaincodes** are just programming code running in an independent container (which can be on multiple languages, we obviously prefer JavaScript 🙂). So the way you get it to work is by deploying it to each organization's peers, they run it and decide if according to the state of the database the rules comply.

## WorldState

Another relevant component is the **World State**. The World State is simply a no sql database usually with CouchDB. It is compiled out of the blockchain status, which means that even though you can edit its contents, anything will really be changed on the blockchain. Any simple change on the blockchain will regenerate it. It is link to an specific peer of the organization.

For JavaScript chaincodes on Hyperledger Fabric, they are made up of config files referencing projects. So, it is usually a set of packages (with models and controllers inside) that are configured through a file typically called `...chaincode.config.json`. So that even if you have packages called something like "@worldsibu/convector-example-dsc-cc-drug", your chaincode can be installed with a simple name like "drug".

------

## What's next

Are you a developer looking to better understand blockchain? Read <a href="https://medium.com/worldsibu/what-is-a-blockchain-for-a-software-developer-a-not-so-complicated-explanation-of-the-technology-d94e4d8ca817" target="_blank">this post</a> from our CTO explaining what a blockchain means for a software developer.
