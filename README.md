# CONVECTOR SUITE

The Convector Suite is an Open Source Suite for Enterprise Blockchain Networks created and maintained by [WorldSibu](https://covalentx.com). It is composed of a group of Development tools for Hyperledger Fabric and aims to be an agnostic toolset.

> [WorldSibu](https://covalentx.com?ref=github) is an enterprise development platform for private blockchain systems. Creators of the open source suite [Convector](https://covalentx.com/convector?ref=github), as well as the enterprise offering [Forma](https://covalentx.com/forma?ref=github), the blockchain infrastructure automation platform with multi-cloud capabilities.

The Convector Suite is targeted at beginners and experts alike. For newcomers to the blockchain world is the easiest and fastest way to create great code. For experts it's the means to efficiently create scalable and secure code. The Convector Suite follows modern coding paradigms and was built from the ground up to run in multiple ledger technologies.

The Convector Suite main components are:

* <a href="https://covalentx.com/convector/convector-smart-contracts?ref=github" target="_blank">Convector Smart Contracts</a> - JavaScript-based Development Framework for Enterprise Smart Contract Systems
* <a href="https://covalentx.com/convector/hurley-development-environment?ref=github" target="_blank">Hurley</a> - the easiest way to quickly setup your Hyperledger development environment. Instead of learning all the config files required and navigating tons of yaml files, just do `hurl new` and focus on your smart contract.
* <a href="https://github.com/worldsibu/convector-cli" target="_blank">Convector CLI</a> - the fastest and easiest way to build a new Convector Smart Contracts project. It is fully integrated with Hurley as well.
* <a href="https://github.com/worldsibu/convector-rest-api" target="_blank">Convector REST Server</a> - a RESTful API generator from a Convector smart contract. One command and you can expose your smart contract to the world.

## Some key links:

* [Official Documentation site](https://docs.covalentx.com/convector).
* [Official tutorial for begginers](https://docs.covalentx.com/article/99-tutorial-getting-started)
* [Github code examples](https://github.com/worldsibu) and [Code examples directory](https://docs.covalentx.com/article/73-code-samples)
* [Video tutorials](https://www.youtube.com/watch?v=BmVNMR-O_os&list=PL-1Vd1bTiSr_i2qeqeHCUWaD74ymRvidb)

Have doubts, want to collaborate or just meet other Convector devs around the world? <a href="https://discord.gg/twRwpWt" target="_blank">
        <i class="fab fa-discord"></i>Join the Discord (Chat) Community
    </a>

## What is Convector Smart Contracts?

[![Issues](https://img.shields.io/github/issues-raw/@worldsibu/convector.svg)](https://github.com/hyperledger-labs/convector/issues)
[![Newsletter](https://img.shields.io/badge/Newsletter--orange.svg)](https://covalentx.com/subscribe/)
[![npm](https://img.shields.io/npm/v/@worldsibu/convector-core-chaincode.svg)](https://www.npmjs.com/package/@worldsibu/convector-core-chaincode)
[![Discord](https://img.shields.io/discord/469152206638284800.svg)](https://discord.gg/twRwpWt)

[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

Convector is a **JavaScript-based Development Framework for Enterprise Smart Contract Systems**. Its goal is to make it easier for developers to create, test and deploy enterprise-grade blockchain-based systems by abstracting complexities that make it hard to get started, plus a collection of tools that speed up your go-to-market.

For now, we only support **Hyperledger Fabric**, so this documentation is for using Convector Smart Contracts on Hyperledger Fabric.

**Model/Controller pattern.**  Convector is designed to help you write reusable pieces of code that describe the nature of what a developer can do in a blockchain. A blockchain, in the developer’s eyes, is no more than a data layer protected by a logic layer defining the rules of what the outside world can do in with the inner data. Thus, a really comfortable way of writing chaincode logic (smart contracts) is by having Models describing the shape of the data and Controllers describing the actions and rules that apply to the models.

## Create your first blockchain project

> Make sure you meet the [pre-requisites](https://docs.covalentx.com/article/71-getting-started#prerequisites).

```
npm i -g @worldsibu/convector-cli
conv new car
cd car
npm install

# Start your local blockchain network
npm run env:restart

# Install the smart contract
npm run cc:start -- car

# Send your first transaction to the blockchain - Wait a few seconds!
hurl invoke car car_create '{"id":"car1","name":"jetta", "created":1,"modified":1}'

# See your new record created in the blockchain by visiting: http://localhost:5084/_utils/#database/ch1_car/_all_docs
```

Then, you can visit the [official Docs Site](https://docs.covalentx.com/convector), [automatically add a REST API](https://github.com/worldsibu/convector-rest-api), or build it and [deploy it to an enterprise blockchain network](https://docs.covalentx.com/forma/tutorial).

## Assumptions

This documentation assumes that you are familiar with [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/A_re-introduction_to_JavaScript), [TypeScript](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html), and [Hyperledger Fabric](https://hyperledger-fabric.readthedocs.io/en/release-1.3/) (at least the basics!).

## Are you looking for an option to Hyperledger Composer?

Yes, we are also aware that Composer's development has experienced some changes and a lot of people are facing uncertainty. If you are one of the devs looking for a way to create smart contract systems with native chaincodes in JavaScript, you are in the right place. <a href="https://medium.com/worldsibu/migrating-from-hyperledger-composer-to-convector-framework-marbles-example-7056b0c0f8f1" target="_blank">You may find this resource valuable on how to Migrate from Composer to Convector</a>.

## Support

* [Product Hunt profile](https://www.producthunt.com/posts/convector-smart-contracts)
* For recommendations, feature requests, or bugs go to our [issues section](https://github.com/hyperledger-labs/convector/issues).
* News on Convector, subscribe to our [Newsletter](https://covalentx.com/subscribe/)
* Need support? Chat directly with our team, join our [Discord](https://discord.gg/twRwpWt)
