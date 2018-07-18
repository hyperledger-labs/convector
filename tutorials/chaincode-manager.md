## Guides

- [Getting-Started](https://github.com/worldsibu/convector/blob/develop/tutorials/getting-started.md)
- [Packages](https://github.com/worldsibu/convector/blob/develop/tutorials/packages.md)
- [Models](https://github.com/worldsibu/convector/blob/develop/tutorials/models.md)
- [Controllers](https://github.com/worldsibu/convector/blob/develop/tutorials/controllers.md)
- [ChaincodeManger](https://github.com/worldsibu/convector/blob/develop/tutorials/chaincode-manager.md)
- [DevEnv](https://github.com/worldsibu/convector/blob/develop/tutorials/dev-env.md)

# Development Environment

We have a tool to package and deploy chaincodes generated with convector.
Once you install [@worldsibu/convector-tool-chaincode-manager](https://www.npmjs.com/package/@worldsibu/convector-tool-chaincode-manager) installed you will have the `chaincode-manager` commands available in your `.bin` folder inside the `node_modules`.

## Packaging an app

Packaging a Convector app consits of copying the core chaincode into a folder, install the controllers and move the local references. To avoid this manual labor we have a command avilable to do it for you.

```bash
chaincode-manager package --config ./chaincode.config.json --output ./chaincode
```

The configuration file is expected to have a couple of things:

```json
{
  // This is optional, since chaincodes are installed in a peer container
  // and the npm packages has to be reachable. If you use a private registry
  // you'll have to provide the npmrc file
  "npmrc": "./.npmrc",
  // Optionally, instead of the file, you can provide just the token if you use
  // the standard registry but in private mode
  "npmtoken": "12312312",
  "controllers": [
    // Each controller is a reference to an NPM module, thus you have to provide
    // the name and version, along with the exported class in the `main` file
    // declared in the package.json
    {
      "name": "@worldsibu/test-1",
      "version": "1.0.0",
      "controller": "Test1Controller"
    }, {
      "name": "@worldsibu/test-2",
      // You can provide a path to a local npm package if you want, it will be copied
      "version": "file:./some/local/path",
      "controller": "Test2Controller"
    }
  ]
}
```

## Deploying an app

In order to use the packaged app you have to first install it in the corresponding containers and initialized the logic, to do so, we provide some useful commands:

```bash
# Firts you need to install the chaincodes in every peer
# notice that in our dev env we have two peers, so this will have to be run two times
# with the proper org config file
chaincode-manager --config ./chaincode.config.json install ./chaincode [contract name] [contract version]

# After installing a chaincode, we need to instantiate it, this only has to happen
# in a single peer and all the others will download the block and instantiate automatically
chaincode-manager --config ./chaincode.config.json instantiate [contract name] [contract version]

# Upgrade works with the same logic as instantiate, the peers has to have the chaincode installed already
chaincode-manager --config ./chaincode.config.json upgrade [contract name] [contract version]

# There's a cli helper to easly test invocations to the chaincode
chaincode-manager --config ./chaincode.config.json invoke [contract name] [controller] [function] [...args]
```

----
----

Created with <span style="color: red;">♥</span> by [WorldSibu](http://worldsibu.com/)

[![Issues](https://img.shields.io/github/issues-raw/@worldsibu/convector.svg)](https://github.com/worldsibu/convector/issues)
[![Newsletter](https://img.shields.io/badge/Newsletter--orange.svg)](https://worldsibu.io/subscribe/)
[![Discord](https://img.shields.io/discord/469152206638284800.svg)](https://discord.gg/twRwpWt)

[![npm](https://img.shields.io/npm/v/@worldsibu/convector-core-chaincode.svg)](https://www.npmjs.com/package/@worldsibu/convector-core-chaincode)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
