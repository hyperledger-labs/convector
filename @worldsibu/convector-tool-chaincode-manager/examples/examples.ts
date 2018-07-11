import { Manager } from '../src';

const version = parseInt(process.argv[2] || '1', 10);
const ccName = 'Test' + process.argv[3] || '1';

const manager1 = Manager.fromConfig('./examples/org1.chaincode.config.json');
const manager2 = Manager.fromConfig('./examples/org2.chaincode.config.json');

async function install() {
  console.log('Installing chaincode in the endorser peers');
  await manager1.install(ccName, version.toString());
  await manager2.install(ccName, version.toString());

  console.log('Instantiating chaincode only in one peer');
  await manager1.instantiate(ccName, version.toString());

  console.log('Invoke the controller init method');
  await manager1.initControllers(ccName);
}

async function installFromConfigObject() {
  const _manager = new Manager({
    txTimeout: 300000,
    user: 'admin',
    channel: 'mychannel',
    networkProfile: './examples/network-profile.yaml',
    controllers: [
      {
        name: '@worldsibu/tellus-organization-ccc',
        version: '0.1.0',
        controller: 'OrganizationController'
      }
    ],
    policy: {
      identities: [
        { role: { name: 'member', mspId: 'Org1MSP' } }
      ],
      policy: {
        '1-of': [{ 'signed-by': 0 }]
      }
    }
  });

  await _manager.init();
  await _manager.install(ccName, version.toString());
  await _manager.instantiate(ccName, version.toString());
  await _manager.initControllers(ccName);
}

async function upgrade() {
  await manager1.install(ccName, (version + 1).toString());
  await manager1.upgrade(ccName, (version + 1).toString());
  await manager1.initControllers(ccName);
}

async function invoke() {
  console.log('Invoking the controller test method');
  await manager1.invoke('test_test', ccName);
}

Promise.resolve()
  .then(() => Promise.all([
    manager1.init(),
    manager2.init()
  ]))
  .then(() => install())
  .then(() => invoke());
