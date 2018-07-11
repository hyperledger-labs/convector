/** @module @worldsibu/convector-tool-chaincode-manager */

import { dirname, join, resolve } from 'path';
import { copy, rmdir, mkdirp } from 'fs-extra';
import { copyFileSync, readFileSync, writeFileSync } from 'fs';
import { ClientConfig, ClientHelper } from '@worldsibu/convector-common-fabric-helper';
import { IConfig as ControllersConfig, Config, KV } from '@worldsibu/convector-core-chaincode';

const chaincodePath = dirname(require.resolve('@worldsibu/convector-core-chaincode'));

export { ControllersConfig };

export interface ManagerConfig extends ClientConfig {
  policy: any;
  npmrc?: string;
  controllers: ControllersConfig[];
}

export class Manager extends ClientHelper {
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

  private chaincodeConfig: Config;

  constructor(public config: ManagerConfig) {
    super(config);
  }

  public async init(): Promise<void> {
    await super.init();
    await this.useChannel(this.config.channel);

    this.chaincodeConfig = new Config(this.config.controllers);

    try {
      await this.prepareChaincode(this.chaincodeConfig.getPackages());
    } catch (e) {
      console.log('Error while preparing the chaincode files', e);
      throw e;
    }
  }

  public async install(
    name: string,
    version: string
  ): Promise<void> {
    await this.client.installChaincode({
      txId: this.client.newTransactionID(true),
      chaincodePath,
      chaincodeId: name,
      chaincodeType: 'node',
      chaincodeVersion: version,
      targets: this.client.getPeersForOrg(undefined)
    })
      .catch((e) => {
        console.log('Error during installation', e);
        throw e;
      })
      .then(([ responses, proposal ]) => {
        const e = responses.find(res => res instanceof Error);

        if (e) {
          console.log('Error during installation', e);
          throw e;
        }

        console.log('Installed successfully');
      });
  }

  public async instantiate(
    name: string,
    version: string,
    ...args: string[]
  ): Promise<void> {
    const { proposalResponse } = await this.sendInstantiateProposal({
      args,
      fcn: 'init',
      chaincodeId: name,
      chaincodeVersion: version,
      'endorsement-policy': this.config.policy,
      targets: this.client.getPeersForOrg(undefined)
    });

    await this.processProposal(proposalResponse);

    console.log('Instantiated successfully');
  }

  public async upgrade(
    name: string,
    version: string,
    ...args: string[]
  ): Promise<void> {
    const { proposalResponse } = await this.sendUpgradeProposal({
      args,
      chaincodeId: name,
      chaincodeVersion: version,
      'endorsement-policy': this.config.policy,
      targets: this.client.getPeersForOrg(undefined)
    });

    await this.processProposal(proposalResponse);

    console.log('Upgraded successfully');
  }

  public async initControllers(
    name: string,
    adminOrUser?: string|true
  ) {
    await this.sendTransactionProposal({
      fcn: 'initControllers',
      chaincodeId: name,
      args: [JSON.stringify(this.chaincodeConfig.dump())]
    }, adminOrUser === true);
  }

  private async prepareChaincode(extraPackages: KV = {}) {
    const json = readFileSync(join(chaincodePath, '../../package.json'), 'utf8');

    const pkg = JSON.parse(json);

    delete pkg.watch;
    delete pkg.devDependencies;

    const packagesFolderPath = join(chaincodePath, 'packages');

    try {
      await rmdir(packagesFolderPath);
      await mkdirp(packagesFolderPath);
    } catch (e) {
      // empty
    }

    extraPackages = await Object.keys(extraPackages).reduce(async (pkgs, name) => {
      const packages = await pkgs;

      if (!extraPackages[name].startsWith('file:')) {
        return { ...packages, [name]: extraPackages[name] };
      }

      const packagePath = resolve(process.cwd(), extraPackages[name].replace(/^file:/, ''));

      await mkdirp(join(packagesFolderPath, name));
      await copy(packagePath, join(packagesFolderPath, name));

      return { ...packages, [name]: `file:./packages/${name}` };
    }, Promise.resolve({} as KV)).catch(e => {console.log('Failed to resolve local references', e); return {};});

    pkg.scripts = { start: pkg.scripts.start };
    pkg.dependencies = {
      ...pkg.dependencies,
      ...extraPackages
    };

    writeFileSync(join(chaincodePath, 'package.json'), JSON.stringify(pkg), 'utf8');

    if (this.config.npmrc) {
      copyFileSync(join(chaincodePath, '.npmrc'), resolve(process.cwd(), this.config.npmrc));
    }
  }
}
