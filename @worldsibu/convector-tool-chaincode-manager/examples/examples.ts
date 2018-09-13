import { Manager } from '../src';

const version = parseInt(process.argv[2] || '1', 10);
const ccName = 'Test' + (process.argv[3] || '1');

const manager0 = new Manager({
  skipInit: true,
  txTimeout: 300000,
  // npmtoken: '...',
  userMsp: 'Org1MSP',
  userMspPath: '../convector-tool-dev-env/network-objects/crypto-config/' +
    'peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp',
  networkProfile: './examples/org1.network-profile.yaml',
  controllers: [
    {
      name: 'ccc',
      version: 'file:../convector-core-chaincode/tests/dist/ccc/',
      controller: 'TestController'
    }
  ]
});
const manager1 = Manager.fromConfig('./examples/org1.chaincode.config.json');
const manager2 = Manager.fromConfig('./examples/org2.chaincode.config.json');

async function install() {
  console.log('Installing chaincode in the endorser peers');
  await manager1.install(ccName, version.toString(), 'package');
  await manager2.install(ccName, version.toString(), 'package');

  console.log('Instantiating chaincode only in one peer');
  await manager1.instantiate(ccName, version.toString());

  console.log('Invoke the controller init method');
  await manager1.initControllers(ccName);
}

async function upgrade() {
  console.log('Installing chaincode in the endorser peers');
  await manager1.install(ccName, (version + 1).toString(), 'package');
  await manager2.install(ccName, (version + 1).toString(), 'package');

  console.log('Upgrading the chaincode');
  await manager1.upgrade(ccName, (version + 1).toString());
}

async function invoke() {
  console.log('Invoking the controller test method');
  await manager1.invoke('test_test', ccName);
}

Promise.resolve()
  .then(() => manager0.package('package'))
  .then(() => Promise.all([
    manager1.init(true),
    manager2.init()
  ]))
  //*
  .then(() => install())
  /*/
  .then(() => upgrade())
  //*/
  .then(() => invoke());
