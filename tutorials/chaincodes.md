# Chaincodes

A chaincode or Smart Contract is the code that runs in your blockchain network. A `json` config file is used by Convector to define the controllers that make up your chaincode. If you generated your project with the Convector-CLI, you have a file in the root of your project called `org1.chaincode.config.json` that file is defining what controllers will compose the chaincode.

## Common Patterns

**Multiple packages, each one with a different controller and models.**

For example:

```bash
./packages/**drug-cc**/src/drug.controller.ts
./packages/**participant-cc**/src/participant.controller.ts
```

**A single package with multiple controllers.**

```bash
./packages/**drug-cc**/src/drug.controller.ts
./packages/**drug-cc**/src/transport.controller.ts
```

Either way you decide to go, the compiled result will unify the controllers by routing them through the config file you use to package the chaincode.

A typical Convector config file looks like this:

```json
{
  ...
  "keyStore": "/Users/walter/hyperledger-fabric-network/.hfc-org1",
  "networkProfile": "/Users/walter/hyperledger-fabric-network/network-profiles/org1.network-profile.yaml",
  "controllers": [
    {
      "name": "product-cc",
      "version": "file:./packages/product-cc",
      "controller": "ProductController"
    }
  ],
  ...
}
```

The `controllers` property is an array. It will accept a list of controllers (wherever they are located).

For example, if you have multiple packages with one controller each, you would have something like:

```json
"controllers": [
    {
      "name": "product-cc",
      "version": "file:./packages/product-cc",
      "controller": "ProductController"
    },
    {
      "name": "participant-cc",
      "version": "file:./packages/participant-cc",
      "controller": "ParticipantController"
    }
]
```

If you have just one package with multiple controllers, your config should look like this:

```json
"controllers": [
    {
      "name": "product-cc",
      "version": "file:./packages/product-cc",
      "controller": "ProductController"
    },
    {
      "name": "product-cc",
      "version": "file:./packages/product-cc",
      "controller": "TransportController"
    }
]
```

You can also have a mix of both options.

```json
"controllers": [
    {
      "name": "product-cc",
      "version": "file:./packages/product-cc",
      "controller": "ProductController"
    },
    {
      "name": "product-cc",
      "version": "file:./packages/product-cc",
      "controller": "TransportController"
    },
    {
      "name": "participant-cc",
      "version": "file:./packages/participant-cc",
      "controller": "ParticipantController"
    }
]
```

At the end choosing one or another option is merely a design decision and you can use the one you feel fits your use case the most.
