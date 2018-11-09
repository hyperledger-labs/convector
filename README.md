# CONVECTOR

[![Issues](https://img.shields.io/github/issues-raw/@worldsibu/convector.svg)](https://github.com/worldsibu/convector/issues)
[![Newsletter](https://img.shields.io/badge/Newsletter--orange.svg)](https://worldsibu.io/subscribe/)
[![npm](https://img.shields.io/npm/v/@worldsibu/convector-core-chaincode.svg)](https://www.npmjs.com/package/@worldsibu/convector-core-chaincode)
[![Discord](https://img.shields.io/discord/469152206638284800.svg)](https://discord.gg/twRwpWt)

[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

## What is Convector?

Convector is a **JavaScript-based Development Framework for Enterprise Smart Contract Systems**. Its goal is to make it easier for developers to create, test and deploy enterprise-grade DApps by abstracting complexities that make it hard to get started, plus a collection of tools that speed up your go-to-market.

For now, we only support **Hyperledger Fabric**, so this documentation is for using Convector Smart Contracts on Hyperledger Fabric.

**Model/Controller pattern.**  Convector is designed to help you write reusable pieces of code that describe the nature of what a developer can do in a blockchain. A blockchain, in the developer’s eyes, is no more than a data layer protected by a logic layer defining the rules of what the outside world can do in with the inner data. Thus, a really comfortable way of writing chaincode logic (smart contracts) is by having Models describing the shape of the data and Controllers describing the actions and rules that apply to the models.

| Quick look of Convector | Start with Convector | Fundamentals |
| --- | --- | --- |
| Simple application ready to be used with the whole stack (Hyperledger Fabric, NodeJS, and Angular) using Convector | Setup your project and integrate it with your pipeline and project | Learn Convector development basics, from architecture to components. |
| [Drug Supply Example](https://github.com/worldsibu/convector-example-drug-supply-chain) | [Getting-Started](https://worldsibu.github.io/convector/modules/getting_started.html) | [Fundamentals](https://worldsibu.github.io/convector/modules/fundamentals.html) |

## Assumptions

This documentation assumes that you are familiar with [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/A_re-introduction_to_JavaScript), [TypeScript](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html), and [Hyperledger Fabric](https://hyperledger-fabric.readthedocs.io/en/release-1.3/) (at least the basics!).

## Are you looking for an option to Hyperledger Composer?

Yes, we are also aware that Composer's development has experienced some changes and a lot of people are facing uncertainty. If you are one of the devs looking for a way to create smart contract systems with native chaincodes in JavaScript, you are in the right place. <a href="https://medium.com/worldsibu/migrating-from-hyperledger-composer-to-convector-framework-marbles-example-7056b0c0f8f1" target="_blank">You may find this resource valuable on how to Migrate from Composer to Convector</a>.

## Support

* For recommendations, feature requests, or bugs go to our [issues section](https://github.com/worldsibu/convector/issues).
* News on Convector, subscribe to our [Newsletter](https://worldsibu.io/subscribe/)
* Need support? Chat directly with our team, join our [Discord](https://discord.gg/twRwpWt)
