import { ClientHelper } from '../src/client.helper';
import * as uuid from 'uuid/v4';

const config = require('./chaincode.config.json');
const helper = new ClientHelper(config);

async function test() {
  console.log('Initializing');
  await helper.init();

  const channels = helper.channels.map(ch => ch.name);
  console.log('Channels', channels);

  await helper.useChannel(channels[0]);

  const orgs = helper.organizations;
  console.log('Orgs', orgs);

  const peers = helper.channel.getPeers();
  console.log('Peers', peers.map(p => p.getName()));

  const ccs =
    (await helper.channel.queryInstantiatedChaincodes(peers[0].getPeer(), true)).chaincodes;

  console.log('Chaincodes', ccs.map(cc => cc.name));

  const matrix = Array(20).fill(true);
  for (let i in matrix) {
    console.log(`Starting batch ${i}/${matrix.length}`);
    await Promise.all(matrix.map(async (_, j) => {
      console.log(`Sending request ${j}/${matrix.length} of batch ${i}/${matrix.length}`);
      const response = await helper.invoke('token_init', ccs[0].name, undefined, {
        id: uuid(),
        name: 'Token',
        symbol: 'TKN',
        totalSupply: 0,
        balances: { },
        complex: {
          name: 'Test',
          value: 5
        }
      });
      console.log('Response', response['status'] === 'SUCCESS' ? 'success' : JSON.stringify(response, null, 2));
    }));
  }

  await helper.close();
  // console.log('Result', JSON.stringify(result, null, 2));
}

test();
