import * as Client from 'fabric-client';
import { dirname, join, resolve } from 'path';
import { copy, rmdir, mkdir } from 'fs-extra';
import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { IConfig as ControllersConfig, Config, KV } from '@worldsibu/convector-core-chaincode';
import { Peer, Admin, ClientConfig, ClientHelper } from '@worldsibu/convector-common-fabric-helper';

const chaincodePath = dirname(require.resolve('@worldsibu/convector-core-chaincode'));

export { ControllersConfig, Peer, Admin };

export interface ManagerConfig extends ClientConfig {
  policy: any;
  worldsibuNpmToken: string;
  controllers: ControllersConfig[];
}

export class Manager {
  public static fromConfig(path: string): Manager {
    const config = Manager.readConfig(path);
    return new Manager(config);
  }

  public static readConfig(path: string): ManagerConfig {
    let config: ManagerConfig;

    try {
      config = JSON.parse(readFileSync(path, 'utf8'));
    } catch (e) {
      throw new Error('{INVALID} Failed to read chaincode config file');
    }

    config.admin.msp = join(dirname(path), config.admin.msp);
    config.orderer.msp = join(dirname(path), config.orderer.msp);

    config.peers = config.peers.map(peer => ({
      ...peer,
      msp: join(dirname(path), peer.msp)
    }));

    return config;
  }

  public static extractError(err: string): { status: number, message: string }|void {
    if (!/chaincode error/.test(err)) {
      return;
    }

    const [, status, message] = err.match(/chaincode error \(status: (\d+), message: ([^)]*)\)/);

    return { status: parseInt(status, 10), message };
  }

  public static getCCName(packageName: string): string {
    return packageName.replace(/@worldsibu\//, '');
  }

  public client: ClientHelper;

  private chaincodeConfig: Config;

  constructor(public config: ManagerConfig) {
    this.client = new ClientHelper(config);
  }

  public async init(): Promise<void> {
    await this.client.init();

    this.chaincodeConfig = new Config(this.config.controllers);
    this.prepareChaincode(this.chaincodeConfig.getPackages());
  }

  public async install(
    name: string,
    version: string
  ): Promise<void> {
    const peers = this.client.peers;

    await this.client.client.installChaincode({
      txId: this.client.client.newTransactionID(true),
      chaincodePath,
      targets: peers,
      chaincodeId: name,
      chaincodeType: 'node',
      chaincodeVersion: version
    })
      .then(() => console.log('Installed successfully'))
      .catch((e) => {
        console.log('Error during installation', e.err);
        throw e;
      });
  }

  public async instantiate(
    name: string,
    version: string,
    ...args: string[]
  ): Promise<void> {
    const proposal = await this.client.sendInstantiateProposal({
      args,
      fcn: 'init',
      chaincodeId: name,
      chaincodeVersion: version,
      'endorsement-policy': this.config.policy
    });

    await this.client.processProposal(proposal.proposalResponse, proposal.txId);

    console.log('Instantiated successfully');
  }

  public async upgrade(
    name: string,
    version: string,
    ...args: string[]
  ): Promise<void> {
    const proposal = await this.client.sendUpgradeProposal({
      args,
      chaincodeId: name,
      chaincodeVersion: version,
      'endorsement-policy': this.config.policy
    });

    await this.client.processProposal(proposal.proposalResponse, proposal.txId);

    console.log('Upgraded successfully');
  }

  public async invoke(
    name: string,
    fcn: string,
    user = 'chaincode-admin',
    ...args: string[]
  ): Promise<void> {
    const userContext = await this.client.client.getUserContext(user, true);
    await this.client.client.setUserContext(userContext, true);

    const proposal = await this.client.sendTransactionProposal({
      fcn, args,
      chaincodeId: name,
    });

    await this.client.processProposal(proposal.proposalResponse, proposal.txId);

    console.log('Invocated successfully');
  }

  public async initControllers(
    name: string,
    user = 'chaincode-admin'
  ) {
    await this.invoke(name, 'initControllers', undefined, JSON.stringify(this.chaincodeConfig.dump()));
  }

  private async prepareChaincode(extraPackages: KV = {}) {
    const json = readFileSync(join(chaincodePath, '../../package.json'), 'utf8');

    const pkg = JSON.parse(json);

    delete pkg.watch;
    delete pkg.devDependencies;

    const packagesFolderPath = join(chaincodePath, 'packages');

    await rmdir(packagesFolderPath);
    await mkdir(packagesFolderPath);

    extraPackages = await Object.keys(extraPackages).reduce(async (pkgs, name) => {
      const packages = await pkgs;

      if (!extraPackages[name].startsWith('file:')) {
        return { ...packages, [name]: extraPackages[name] };
      }

      const packagePath = resolve(process.cwd(), extraPackages[name].replace(/^file:/, ''));

      await mkdir(join(packagesFolderPath, name));
      await copy(packagePath, join(packagesFolderPath, name));

      return { ...packages, [name]: `file:./packages/${name}` };
    }, Promise.resolve({} as KV));

    pkg.scripts = { start: pkg.scripts.start };
    pkg.dependencies = {
      ...pkg.dependencies,
      ...extraPackages
    };

    writeFileSync(join(chaincodePath, 'package.json'), JSON.stringify(pkg), 'utf8');
    writeFileSync(join(chaincodePath, '.npmrc'), `//registry.npmjs.org/:_authToken=${this.config.worldsibuNpmToken}`, {
      encoding: 'utf8',
      flag: 'w'
    });
  }
}
