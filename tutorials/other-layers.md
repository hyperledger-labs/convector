# [WIP] Fullstack usage

One of Convector's promises is the fullstack native support for JavaScript development architectures. Here's a quick entry on how to integrate it to NodeJS and Angular 4+ taking advantage of the built in adapters and storage layers that allow you to seamlessly communicate with the underneath layer.

| Let's assume a fairly typical architecture. |
--
| Angular |
| NodeJS |
| Hyperledger Fabric + CouchDB |

Basically data is always in the ledger, the only difference is that when you want to query in a sofisticated way (like filtered or aggregated data) you would use the [World State](https://worldsibu.github.io/convector/modules/hyperledger_fabric.html). The rest is kind of obvious, Angular provides web front end for customers whereas NodeJS works as a backend communicating with the blockchain nodes and using the crypto materials to secure transactions.

To allow this integration, the native transpiled Models-Controllers definitions offer a `client` folder with the resulting model and controller ready to be *imported* by Node and Angular.

The **Adapters** and **Storages** components, let you, through the `client` files, inject implementations based on the layer you are using the code.

## Adding Convector to NodeJS

A NodeJS backend should communicate with one or more nodes, it should sign transactions, and orchestrate calls between the blockchain and the World State database. Adapters and Storages will handle the basic tasks, like calling a Chaincode function or retriving data from the ledger, all you have to do is setup them correctly based on your topology.

Somewhere in your code you will need to import the `client` files, as well setup Adapters and Storages.

```typescript
/**
 * Building this adapter allows you to communicate with the
 * test env created by `convector-tool-dev-env`.
 */
export namespace DrugController {
  export async function init(): Promise<DrugControllerClient> {
    const user = process.env.USERCERT || 'user1';

    await SelfGenContext.getClient();

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
    return new DrugControllerClient(adapter);
  }
}

```


## Adding Convector to Angular

In this case, Angular will always call NodeJS which subsequently calls the nodes. What is important here is to keep the Models' structures as well the interfaces



As you can see, it's rather easy to integrate Convector to other TypeScript/JavaScript based projects due to its native development model.

---- 

## What's next

Want to see an out of the box project working? Take a look at the [Drug Supply Example](https://github.com/worldsibu/convector-example-drug-supply-chain).
