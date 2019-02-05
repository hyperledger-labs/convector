# Tips and tricks

## Tip 1: use external packages, but be careful

With the NodeJS support from Fabric you can use external packages from NPM and other into your smart contract code. Don't limit yourself to the ones Convector provides or just vanilla JavaScript.

### Be careful

The code running in a chaincode container (smart contracts) has to be deterministic. This means that everywhere and anywhere it is executed with the same inputs should return the same outputs.

This is because your code will be executed distributely amongst computers (nodes) running in different contexts. Avoid using **date based calculations, randoms, external sources, or any other input of data that you are not sure will be avilable for all the participants.**

In some cases, the rol of Oracles is needed, what these special participants do is put data in the blockchain that can be used as inputs for chaincode operations. Since the data is put in the blockchain it now becomes a deterministic source. A common example is an exchange rate or weather information.

## Tip 2: debugging and testing

Unit testing is a best practice in modern software development. Blockchain with Convector is not an exception. You can use the built in Mock Controller Adapter `@worldsibu/convector-adapter-mock` to simulate that your code is executed in the blockchain.

You can find an easy example here: https://github.com/worldsibu/convector-example-drug-supply-chain/blob/master/%40worldsibu/chaincodes/cc-drug/tests/drug.spec.ts

Automate your tests and integrate them with your build processes for best results.

For debugging, you can just connect your debugger to your unit tests https://stackoverflow.com/questions/30023736/mocha-breakpoints-using-visual-studio-code or put a lot of `console.log` around. Doesn't matter on which team you are. 😁

## Tip 3: Users in the blockchain

Users and admins are not created by Convector, unlike other frameworks Convector doesn't get in the middle of that to avoid extra errors or security issues.

So the pattern that Convector follows is:

1. Users and admins are created as regular users in the Fabric model, whether it's a CA or not
2. You can then create a chaincode to register your users and make them "available" to reference from other smart contracts. I.e.: https://github.com/worldsibu/convector-example-drug-supply-chain/blob/master/%40worldsibu/chaincodes/cc-participant/src/participant.controller.ts
3. Usually the pattern is to include `x509` -fingerprint in the chaincode. I.e.: https://github.com/worldsibu/convector-example-drug-supply-chain/blob/master/package.json#L26
4. In your "business chaincode" (the one that is not for participants) you receive a tx, you get the `this.sender` and compare it against text fields that previously were set with a fingerprint of the expected user to do a task

The full practical example can be found here: https://github.com/worldsibu/convector-example-drug-supply-chain
