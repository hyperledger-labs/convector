import { ClientHelper } from '../src/client.helper';

const config = require('./chaincode.config.json');

const helper = new ClientHelper(config);

async function test() {
  await helper.init();

  const channels = helper.channels.map(ch => ch.name);
  console.log('Channels', channels);

  await helper.useChannel(channels[0]);

  const orgs = helper.organizations;
  console.log('Orgs', orgs);

  const peers = helper.channel.getPeers();
  console.log('Peers', peers.map(p => p.getName()));

  const ccs =
    (await helper.channel.queryInstantiatedChaincodes(peers[0], true)).chaincodes;

  console.log('Chaincodes', ccs.map(cc => cc.name));

  const result = await helper.invoke('participant_register', ccs[0].name, undefined, {
    id: '1',
    name: 'Test',
    organization: orgs[0]
  });

  console.log('Result', JSON.stringify(result, null, 2));
}

test();
