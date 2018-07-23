## Guides

- [Getting-Started](https://github.com/worldsibu/convector/blob/develop/tutorials/getting-started.md)
- [A typical starter project](https://github.com/worldsibu/convector/blob/develop/tutorials/starter-project.md)
- [Packages](https://github.com/worldsibu/convector/blob/develop/tutorials/packages.md)
- [Models](https://github.com/worldsibu/convector/blob/develop/tutorials/models.md)
- [Controllers](https://github.com/worldsibu/convector/blob/develop/tutorials/controllers.md)
- [ChaincodeManger](https://github.com/worldsibu/convector/blob/develop/tutorials/chaincode-manager.md)
- [DevEnv](https://github.com/worldsibu/convector/blob/develop/tutorials/dev-env.md)

# Starter Project

As said before, Convector doesn't require `Lerna` to run, but we highly recommend it. This starter project's source code can be found [here](https://github.com/worldsibu/convector-example-drug-supply-chain).

We also like mono-repos, and even though they are not required here either, this examples works like that.

## Some basic concepts about Hyperledger Fabric

A Hyperledger Fabric network is not more than some software connected with each other (peers container), a service in charge of making sure the consensus and other communication matters work (orderer container), some cryptographic components that allow for organizations to have control over their resources (Certificate authorities - in this example emulated) and the blockchain, which is made up of Smart Contracts (also referred to as chaincodes) and the ledger (the underlying distributed database). There are other advanced concepts, but for development matters, those are the relevant ones.

A Smart Contracts is just programming code running in an independent container (which can be on multiple languages, we obviously prefer JavaScript 🙂). So the way you get it to work is by deploying it to each organization's peers, they run it and decide if according to the state of the database the rules comply.

Another relevant component is the World State. The World State is simply a no sql database usually with CouchDB. It is compiled out of the blockchain status, which means that even though you can edit its contents, anything will really be changed on the blockchain. Any simple change on the blockchain will regenerate it. It is link to an specific peer of the organization.

For JavaScript chaincodes on Hyperledger Fabric, they are made up of config files referencing projects. So, it is usually a set of packages (with models and controllers inside) that are configured through a file called `...chaincode.config.json`. Even if you have packages called something like "@worldsibu/convector-example-dsc-cc-drug", your chaincode can be installed with a simple name like "drug".

## A typical development lifecycle

Based on the previous explanation the flow of your application would look like:

* Your front end calls your api or backend service.
* Your backend service will run under de identity of a blockchain participant.
* Your backend can call any of three components:
  * The World State database. (it can be done by injecting a Convector **storage** to your referenced model)
  * The chaincodes inside the peers. (it can be done by injecting a Convector **adapter** to your Controller Client generated file from your programmed chaincode controller)
  * Another off-chain service.

To create a smart contract system you need:

* Your code. Containing your smart contracts.
  * It is usually made up of front end modules, backend or APIs, peers (nodes) which run the smart contracts.
* A development environment (a fullblown test blockchain) created by the [DevEnv](https://github.com/worldsibu/convector/blob/develop/tutorials/dev-env.md).
* A set of tools to interact with the blockchain, such as [ChaincodeManger](https://github.com/worldsibu/convector/blob/develop/tutorials/chaincode-manager.md).

If you are working with a mono-repo like us, this scripts in your root `package.json` will make your life easier.

```json
"scripts": {
    "wait": "sleep 5",
    "user:fingerprint": "f () { node -e \"console.log(JSON.parse(require('fs').readFileSync('./.convector-dev-env/.hfc-$1/$2', 'utf8')).enrollment.identity.certificate)\" | openssl x509 -fingerprint -noout | cut -d '=' -f2 ; }; f",
    "================= Life cycle =================": "==================================",
    "install": "npm-run-all -s lerna:install",
    "init": "npm-run-all -s env:init 'cc:start -- 1'",
    "start": "npm-run-all -s env:start",
    "clean": "npm-run-all -s env:stop env:clean",
    "restart": "npm-run-all -s clean install start init",
    "test": "npm-run-all -s lerna:test",
    "================= Lerna =================": "==================================",
    "lerna:install": "lerna bootstrap",
    "lerna:build": "lerna run build",
    "lerna:stop": "lerna run stop --parallel",
    "lerna:clean": "lerna clean --yes && lerna run clean --parallel",
    "lerna:test": "lerna exec npm run test",
    "lerna:lint": "lerna run lint",
    "================= Dev Env =================": "==================================",
    "env:init": "./node_modules/@worldsibu/convector-tool-dev-env/scripts/init.sh",
    "env:start": "./node_modules/@worldsibu/convector-tool-dev-env/scripts/start.sh",
    "env:stop": "./node_modules/@worldsibu/convector-tool-dev-env/scripts/stop.sh",
    "env:restart": "./node_modules/@worldsibu/convector-tool-dev-env/scripts/restart.sh",
    "env:clean": "./node_modules/@worldsibu/convector-tool-dev-env/scripts/clean.sh",
    "================= Chaincodes =================": "==================================",
    "cc:start": "f() { npm-run-all -s cc:package -p \"cc:install -- org1 $1\" \"cc:install -- org2 $1\" -s wait \"cc:instantiate -- $1\"; }; f",
    "cc:package": "chaincode-manager --config ./org1.chaincode.config.json --output ./chaincode package",
    "cc:install": "f() { chaincode-manager --config ./$1.chaincode.config.json install ./chaincode <PUT HERE YOUR CC NAME> $2; }; f",
    "cc:instantiate": "chaincode-manager --config ./org1.chaincode.config.json instantiate <PUT HERE YOUR CC NAME>",
    "cc:upgrade": "chaincode-manager --config ./org1.chaincode.config.json upgrade <PUT HERE YOUR CC NAME>",
    "cc:invoke": "f() { chaincode-manager --config ./$1.chaincode.config.json invoke <PUT HERE YOUR CC NAME> ${@:2}; }; f",
    "cc:upgradeInAll": "f() { npm-run-all -s cc:package \"cc:install -- org1 $1\" \"cc:install -- org2 $1\" \"cc:upgrade -- $1\"; }; f"
  },
```
\* [npm-run-all](https://www.npmjs.com/package/npm-run-all) is used on those scripts.

If seen closely, you get all those commands your lifecycle development will need.

* cc:* these are the commands to handle the installation, upgrade or invoke of your chaincodes.
  * A chaincode usually needs to be 1.) packaged 2.) installed on each peer 3.) instantiated
    * There are helpers among these helpers. For example `npm run cc:start 1.0` will install your chaincode for the first time by calling `cc:package`, `cc:install` and lastly `cc:instantiate`. But we keep each task there for granularity and empowering you for more advanced scenarios.
  * If upgrading the code (like applying a fix) you need to 1.) package 2.) install on each peer 3.) upgrade on one peer.
* env:* these are related to the blockchain components running on your computer. The names are clear by themselves.

## Typical order of tasks you perform while developing.

1. Code your chaincode.
2. Test it locally (we encourage to make unit testing through the mock adapter, since testing against the blockchain takes a lot of time due to the installation process).
3. Deploy to the blockchain! Probably you haven't provisioned the blockchain yet, so you can run `npm run env:restart`.
4. And install your chaincode `npm run cc:start 1.0`, it will call the previously seen tasks which uses each of the  `...chaincode.config.json` files (you need to generate one for each organization to install it on every participant). But before:
5. Compile your chaincode project. Let's say your chaincode project is at 'root/@worldsibu/chaincodes/cc-drug' (like in the source code referenced to this project) so you would add these tasks at the `package.json`. Tasks to include: 
```json 
"client:generate": "generate-controller-interface -c DrugController",
"------------ STANDARD TASKS ------------": "",
"clean": "rimraf dist client",
"build": "npm run clean && npm run client:generate && tsc",
"prepare": "npm run build" 
```
6. Run `npm run build` at that folder, or if using lerna `lerna run build --scope @worldsibu/convector-example-dsc-cc-drug`.
7. Be sure that each `...chaincode.config.json` file is configured correctly with the packages and references to your project and the name you like to give to your chaincode! 
2. Proceed to run `npm run cc:start 1.0`.
3. This installation task may take some time.
4. A new folder was generated at the root of your project called "chaincode" it is automatically regenerated on each package.
5. A common next task would be adding your chaincode base components to your backend (model and controller - in the case of Convector when compiling a chaincode project a clean Controller Client gets built for you to inject the implementation of the logic).
6. Add the chaincode project as dependencies to you backend project. We like at least this structure inside your server project: 
  1. utils / - controller.ts, - helper.ts, - models.ts, - index.ts
7. The reason for those files (as you can see in the source code referenced) is to inject the Adapters and Storages used on this specific project. 
8. Since we are using the official SDK from the Hyperledger Project, we need to provide a **Network Profile**. It is a simple JSON containing the setup of your network. After you started the blockchain in your computer with `npm run env:restart` a folder was automatically created with the name `.convector-dev-env` go and copy each file `.convector-dev-env/examples/org1.network-profile.yaml` and `.convector-dev-env/examples/org2.network-profile.yaml` those are examples of that network profile you need. Change the setting accordingly to your project and store them in an accesible path for the server. We like to copy them to a `/config` folder inside the server. Checkout the referenced source code to see it in action.
9. That newly created folder `.convector-dev-env` will be referenced by a lot of files to access the certificates with which your servers and users will run. For example, as seen before, the network profile (which is used by the Fabric SDK needs them), the chaincode manager will also require them to access the admin credentials to install chaincodes and also de dev env which itself generated them.

We recommend checking out this project to put every required component where needed [access code](https://github.com/worldsibu/convector-example-drug-supply-chain).

