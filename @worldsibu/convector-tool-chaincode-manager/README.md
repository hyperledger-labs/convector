# Convector Tool Chaincode Manager

This module contains the chaincode manager with tools to install and run chaincodes in a blockchain. This creates a binary called `chaincode-manager` in the `node_modules/.bin` folder.

## Manager Config

The command relies on a configuration file provided at invocation. The file structure is detailed next:

- `worldsibuNpmToken` - the npm worldsibu token, if you don't have this, means you don't have permission to run our framework and it will fail to install
- `channel` - the channel where the chaincode is gonna be installed
- `peers` - a list of peers information, containing the `url` and a reachable `msp` path
- `orderer` - the orderer information, containing  the `url` and a reachable `msp` path
- `admin` - the user with admin privileges information, containing the user `name`, `mspName`, and `msp` path
- `controllers` - a list of controllers to bound together in the chaincode, containing the npm package `name`, npm package `version` and the `controller` class name found in the package
- `policy` - a policy object, check the fabric sdk [documentation](https://fabric-sdk-node.github.io/global.html#ChaincodeInstantiateUpgradeRequest) for the `endorsement-policy` field for mor information

All paths are resolved relative to the config file.

Here's an example on [how the file looks](https://bitbucket.org/worldsibu/tellus/src/develop/env/chaincode.config.json)

## Manager Commands

- `chaincode-manager install <name> <version>` - install a new for the first time, this can be only executed the first time this chaincode is going to be install using this name
- `chaincode-manager upgrade <name> <version>` - upgrade an existing chaincode
- `chaincode-manager invoke <name> <controller> <function> [args...]` - invoke a function under a controller in a previously installed chaincode
- All the commands demand a `-c ./chaincode.config.json` flag
