# NodeJS Integration

One of Convector's promises is the fullstack native support for JavaScript development architectures. Here's a quick entry on how to integrate it to NodeJS taking advantage of the built in adapters and storage layers that allow you to seamlessly communicate with the blockchain nodes.

Let's assume a fairly typical architecture.

![JavaScript Fullstack Architecture](media://architecture-fullstack.png)

Basically data is always in the ledger, when you want to submit transactions you call the Blockcchain nodes, when you want to query data, you call the CouchDB [World State](https://worldsibu.github.io/convector/modules/hyperledger_fabric.html).

To allow this integration, the native transpiled Models-Controllers definitions offer a `client` folder with the resulting model and controller ready to be *imported* by your NodeJS server.

The **Adapters** and **Storages** components, let you, through the `client` files, inject implementations based on the layer you are using the code. See [[Fundamentals]] for more technical details on adapters and storage layers.

This tutorial references to this example implementation: [Drug Supply Example](https://github.com/worldsibu/convector-example-drug-supply-chain).

## Adding Convector to a NodeJS Server

A NodeJS backend should communicate with one or more nodes, it should sign transactions, and orchestrate calls between the blockchain and the World State database. Adapters and Storages will handle the basic tasks, like calling a Chaincode function or retriving data from the ledger, all you have to do is setup them correctly based on your topology.

Somewhere in your code you will need to **import** the `client` files, as well **setup** Adapters and Storages.

### Setting up the connections

Be sure to set the following `env` variables first.

Replace the values depending on your settings, the following values are defined as per a Convector [[Development-Environment]] setup.

```bash
KEYSTORE=../../../.convector-dev-env/.hfc-org1
USERCERT=user1
ORGCERT=org1
NETWORKPROFILE=../config/org1.network-profile.yaml
CHANNEL=ch1
CHAINCODE=<YOUR-CHAINCODE>
COUCHDBVIEW=ch1_<YOUR-CHAINCODE>
COUCHDB_PORT=5984
COUCHDB_HOST=localhost
COUCHDB_PROTOCOL=http
```

Create a `selfGenContext.ts` file. It will setup an user context which the official `Fabric SDK` will run on.

Full file in [selfGenContext.ts](https://github.com/worldsibu/convector-example-drug-supply-chain/blob/master/%40worldsibu/server/src/selfGenContext.ts).

```typescript
export namespace SelfGenContext {

  interface IdentityFiles {
    privateKey: string;
    signedCert: string;
  }

  export async function getClient() {
    // Check if needed
    const contextPath = join(__dirname, process.env.KEYSTORE + '/' + process.env.USERCERT);

    fs.readFile(contextPath, 'utf8', async function (err, data) {
      if (err) {
        // doesnt exist! Create it.
        const client = new Client();

        console.log('Setting up the cryptoSuite ..');

        // ## Setup the cryptosuite (we are using the built in default s/w based implementation)
        const cryptoSuite = Client.newCryptoSuite();
        cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({
          path: process.env.KEYSTORE
        }));

        client.setCryptoSuite(cryptoSuite);

        console.log('Setting up the keyvalue store ..');

        // ## Setup the default keyvalue store where the state will be stored
        const store = await Client.newDefaultKeyValueStore({
          path: process.env.KEYSTORE
        });

        client.setStateStore(store);

        console.log('Creating the admin user context ..');

        const privateKeyFile = fs.readdirSync(process.env.KEYSTORE + '/keystore')[0];

        // ###  GET THE NECESSRY KEY MATERIAL FOR THE ADMIN OF THE SPECIFIED ORG  ##
        const cryptoContentOrgAdmin: IdentityFiles = {
          privateKey: process.env.KEYSTORE + '/keystore/' + privateKeyFile,
          signedCert: process.env.KEYSTORE + '/signcerts/cert.pem'
        };

        await client.createUser({
          username: process.env.USERCERT,
          mspid: `${process.env.ORGCERT}MSP`,
          cryptoContent: cryptoContentOrgAdmin,
          skipPersistence: false
        });

        return client;
      } else {
        console.log('Context exists');
      }
    });

  }
}
```

### Setup your controller's Adapter to point to the Blockchain nodes

Setup a `FabricControllerAdapter`. Adapters are injected into `Convector Clients` (the one automatically compiled for you).

By injecting an adapter, you are pretty much telling the empty self generated `client` to route function calls to the Hyperledger Fabric blockchain nodes. As if it was magic, when calling the same function you defined in the chaincode inside of your NodeJS server project, the framework will call the blockchain.

Full file in [controllers.ts](https://github.com/worldsibu/convector-example-drug-supply-chain/blob/master/%40worldsibu/server/src/utils/controllers.ts).


```typescript
/**
 * Building this adapter allows you to communicate with the
 * test env created by `convector-tool-dev-env`.
 */
export namespace DrugController {
  export async function init(): Promise<DrugControllerClient> {
    const user = process.env.USERCERT || 'user1';

    await SelfGenContext.getClient();

    // Inject a Adapter of type *Fabric Controller*
    // Setup accordingly to the
    const adapter = new FabricControllerAdapter({
      txTimeout: 300000,
      user: user,
      channel: process.env.CHANNEL,
      chaincode: process.env.CHAINCODE,
      keyStore: resolve(__dirname, process.env.KEYSTORE),
      networkProfile: resolve(__dirname, process.env.NETWORKPROFILE),
      userMspPath: process.env.KEYSTORE
    });

    await adapter.init();

    // Return your own implementation of the controller
    return new DrugControllerClient(adapter);
  }
}
```

### Setup your model's Storage to point to the CouchDB

Setup a `CouchDBStorage`. Storages are injected into `Convector Models` (the ones automatically compiled for you).

By injecting an storage, you are pretty much telling the empty self generated `client` to route query function calls to the CouchDB WorldState database. Same with Controllers, when calling the  function you would call to load a model from the chaincode (i.e.: `getOne()`) the framework will call the CouchDB.

Full file in [models.ts](https://github.com/worldsibu/convector-example-drug-supply-chain/blob/master/%40worldsibu/server/src/utils/models.ts).

```typescript
// Inject the setting to your preferred CouchDB server
BaseStorage.current = new CouchDBStorage({
  host: process.env.COUCHDB_HOST,
  protocol: process.env.COUCHDB_PROTOCOL,
  port: process.env.COUCHDB_PORT
}, process.env.COUCHDBVIEW);
```

### Invoke your Fabric injected Controller

Now that the controller has been initialized, you can start making calls right from your NodeJS controller or Services files.

Full file in [drug.controller.ts](https://github.com/worldsibu/convector-example-drug-supply-chain/blob/master/%40worldsibu/server/src/controllers/drug.controller.ts).

```typescript
let cntrl = await DrugController.init();
    await cntrl.transfer(id, to, reportHash, reportUrl, Date.now());
```

### Invoke your Fabric injected Model

Same with controllers, once we route the calls to our own implementation servers, you can make calls from your NodeJS files.

Full file in [drug.controller.ts](https://github.com/worldsibu/convector-example-drug-supply-chain/blob/master/%40worldsibu/server/src/controllers/drug.controller.ts).

```typescript
// Load an specific model
await Models.Drug.getOne(fId)

// More advanced query to a CouchDB View
const dbName = `${channel}_${cc}`;
const viewUrl = '_design/drugs/_view/all';

await Models.Drug.query(Models.Drug, dbName, viewUrl, queryOptions);
```

### Now you have a backend ready to work with your blockchain network!

As you can see, it's rather easy to integrate Convector to other TypeScript/JavaScript based projects due to its native development model.

---- 

## What's next

Want to see an out of the box project working? Take a look at the [Drug Supply Example](https://github.com/worldsibu/convector-example-drug-supply-chain).
