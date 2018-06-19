import { join } from 'path';
import { homedir } from 'os';
import * as program from 'commander';
import { randomBytes } from 'crypto';
import * as Fabric from 'fabric-client';
import * as FabricCA from 'fabric-ca-client';

export interface FabricConfig {
  store: string;
  caUrl: string;
  caName: string;
}

export interface OrgConfig {
  user: string;
  password: string;
  msp: string;
}

export interface UserConfig {
  user: string;
  msp: string;
  admin: string;
  affiliation: string;
  role: string;
}

const defaultFabricConfig: FabricConfig = {
  store: join(homedir(), '.hfc-key-store'),
  caUrl: 'http://localhost:7054',
  caName: 'ca.example.com'
};

const defaultOrgConfig: OrgConfig = {
  user: 'admin',
  msp: 'Org1MSP',
  password: 'adminpw'
};

const defaultUserConfig: UserConfig = {
  user: 'user1',
  role: 'client',
  affiliation: 'org1.department1'
} as any;

let fabric: Fabric;
let fabricCA: FabricCA;

async function setup(config: FabricConfig) {
  config = { ...defaultFabricConfig, ...config };

  const {
    store: path,
    caUrl: url,
    caName: name
  } = config;

  fabric = new Fabric();
  const store = await Fabric.newDefaultKeyValueStore({ path });

  // use the same location for the state store (where the users' certificate are kept)
  // and the crypto store (where the users' keys are kept)
  const cryptoStore = Fabric.newCryptoKeyStore({ path });
  const cryptoSuite = Fabric.newCryptoSuite();
  cryptoSuite.setCryptoKeyStore(cryptoStore);

  fabric.setStateStore(store);
  fabric.setCryptoSuite(cryptoSuite);

  fabricCA = new FabricCA(url, undefined, name, cryptoSuite);
}

async function setUpAdmin(username: string, password: string, mspid: string): Promise<Fabric.User> {
  const user = await fabric.getUserContext(username, true);

  if (user && user.isEnrolled()) {
    await fabric.setUserContext(user);
    return;
  }

  const enrollment = await fabricCA.enroll({
    enrollmentID: username,
    enrollmentSecret: password
  });

  const fabricUser = await fabric.createUser({
    skipPersistence: false,
    mspid,
    username,
    cryptoContent: {
      privateKeyPEM: enrollment.key.toBytes(),
      signedCertPEM: enrollment.certificate
    }
  });

  await fabric.setUserContext(fabricUser);
}

async function setUpUser(
  username: string,
  mspid: string,
  admin: string,
  affiliation: string,
  role: string
): Promise<Fabric.User> {
  const user = await fabric.getUserContext(username, true);

  if (user && user.isEnrolled()) {
    await fabric.setUserContext(user);
    return;
  }

  const adminUser = await fabric.getUserContext(admin, true);
  const secret = await fabricCA.register({
    role,
    affiliation,
    enrollmentID: username
  }, adminUser);

  const enrollment = await fabricCA.enroll({
    enrollmentID: username,
    enrollmentSecret: secret
  });

  const fabricUser = await fabric.createUser({
    skipPersistence: false,
    mspid,
    username,
    cryptoContent: {
      privateKeyPEM: enrollment.key.toBytes(),
      signedCertPEM: enrollment.certificate
    }
  });

  await fabric.setUserContext(fabricUser);
}

async function registerOrg(config: OrgConfig) {
  config = { ...defaultOrgConfig, ...config };
  const { user, password, msp } = config;

  await setUpAdmin(user, password, msp);
}

async function registerUser(config: UserConfig) {
  config = { ...defaultOrgConfig, ...defaultUserConfig, ...config } as any;
  const { user, admin, msp, role, affiliation } = config;

  await setUpUser(user, msp, admin, affiliation, role);
}

/**
 * Parses the cli format user1:password1,user2:password2 into
 * [[user1, password1], [user2, password2]]
 */
function parseUserList(val: string): [string, string][] {
  return list(val).map(v => v.split(':') as [string, string]);
}

function list(val: string) {
  return val.split(',');
}

if (require.main === module) {
  program
    .option('-m, --msp <id>', 'The MSP ID', defaultOrgConfig.msp)
    .option('-cu, --ca-url <url>', 'The CA url', defaultFabricConfig.caUrl)
    .option('-c, --ca-name <name>', 'The CA name', defaultFabricConfig.caName)
    .option('-s, --store <path>', 'The absolute path to the store', defaultFabricConfig.store)
    .option('-u, --users <user1:affiliation1:role1[,user2...]>', 'The users info',
      parseUserList, [[
        defaultUserConfig.user,
        defaultUserConfig.affiliation,
        defaultUserConfig.role
      ]])
    .option('-a, --admin <user:password>', 'The admin user info', parseUserList,
      [[ defaultOrgConfig.user, defaultOrgConfig.password ]])
    .parse(process.argv);

  const opts = program.opts() as any;

  Promise.resolve()
    .then(params => console.error('Using params', JSON.stringify(opts, null, 2)))
    .then(() => setup(opts))
    .catch(err => console.error('Failed to set up fabric, check your params and connection', err))
    .then(() => registerOrg({
      ...opts,
      user: opts.admin[0][0],
      password: opts.admin[0][1]
    }))
    .catch(err => console.error('Failed to register the organization and admin, check your params', err))
    .then((org) =>
      Promise.all(opts.users.map(([ user, affiliation, role ]) =>
        registerUser({
          ...opts,
          user,
          role,
          affiliation,
          admin: opts.admin[0][0]
        })
      ))
    )
    .catch(err => console.error('Failed to register the users, check your params', err));
}

export {
  setup,
  registerOrg,
  registerUser
};
