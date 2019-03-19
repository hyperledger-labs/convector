/** @module @worldsibu/convector-tool-chaincode-manager */

import { dirname, join, resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { copy, emptyDir, mkdirp, ensureDir, writeFile, remove } from 'fs-extra';
import { ClientConfig, ClientHelper } from '@worldsibu/convector-common-fabric-helper';
import { IConfig as ControllersConfig, Config, KV } from '@worldsibu/convector-core-chaincode';

const chaincodePath = dirname(require.resolve('@worldsibu/convector-core-chaincode'));

export { ControllersConfig };

export interface ManagerConfig extends ClientConfig {
  policy?: any;
  npmrc?: string;
  npmtoken?: string;
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

  public chaincodeConfig = new Config(this.config.controllers);

  constructor(public config: ManagerConfig) {
    super(config);
  }

  public async init(initKeyStore?: boolean): Promise<void> {
    await super.init(initKeyStore);
    await this.useChannel(this.config.channel);
  }

  public async install(
    name: string,
    version: string,
    path: string
  ): Promise<void> {
    console.log('Installing now...');
    await this.client.installChaincode({
      txId: this.client.newTransactionID(true),
      chaincodePath: resolve(process.cwd(), path),
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
    console.log('Instantiating now...');
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
    console.log('Upgrading now...');
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
    console.log('Initializing controllers now...');
    const { proposalResponse } = await this.sendTransactionProposal({
      fcn: 'initControllers',
      chaincodeId: name,
    }, adminOrUser === true);

    await this.processProposal(proposalResponse);

    console.log('Initialization successfully');
  }

  /**
   * The only expected param is json object with the keys being
   * the npm package name for the controller and the value being the npm version
   *
   * Instead of version, one can use a relative path to a local npm module.
   * This should be a valid npm module folder containing a package.json
   * with a `start` script on it. This is the command that's gonna be executed
   * in the peer before instantiating the chaincode, so all dependencies must be
   * resolved by the peer network.
   *
   * An optional `npmrc` path can be set in the config file if needed, like for
   * installing private packages and/or packages from a custom repository.
   * Or you can pass the `npmtoken` and we'll create the file for you.
   *
   * @param output A path for the output folder
   * @param controllers A key value map of package:version for the controllers
   */
  public async package(output: string, controllers: KV = this.chaincodeConfig.getPackages()) {
    output = resolve(process.cwd(), output);

    try {
      await ensureDir(output);
    } catch (e) {
      throw new Error('The output is not a valid directory');
    }

    await remove(output);

    try {
      await copy(chaincodePath, output);
    } catch (e) {
      throw new Error('Error while copying the base chaincode to the output path');
    }

    const json = readFileSync(join(chaincodePath, '../../package.json'), 'utf8');

    const pkg = JSON.parse(json);

    delete pkg.watch;
    delete pkg.devDependencies;
    pkg.devDependencies = pkg.chaincodeDevDependencies || {};

    const packagesFolderPath = join(output, 'packages');

    try {
      await emptyDir(packagesFolderPath);
      await mkdirp(packagesFolderPath);
    } catch (e) {
      // empty
    }

    controllers = await Object.keys(controllers).reduce(async (pkgs, name) => {
      const packages = await pkgs;

      if (!controllers[name].startsWith('file:')) {
        return { ...packages, [name]: controllers[name] };
      }

      const packagePath = resolve(process.cwd(), controllers[name].replace(/^file:/, ''));

      await mkdirp(join(packagesFolderPath, name));
      await copy(packagePath, join(packagesFolderPath, name));

      try {
        await emptyDir(join(packagesFolderPath, name, 'node_modules'));
      } catch (e) {
        // empty
      }

      return { ...packages, [name]: `file:./packages/${name}` };
    }, Promise.resolve({} as KV)).catch(e => {console.log('Failed to resolve local references', e); return {};});

    pkg.scripts = { start: pkg.scripts.start, 'start:debug': pkg.scripts['start:debug'] };
    pkg.dependencies = {
      ...pkg.dependencies,
      ...controllers
    };

    writeFileSync(join(output, 'package.json'), JSON.stringify(pkg), 'utf8');

    if (this.config.npmrc) {
      await copy(resolve(process.cwd(), this.config.npmrc), join(output, '.npmrc'));
    } else if (this.config.npmtoken) {
      await writeFile(
        join(output, '.npmrc'),
        `//registry.npmjs.org/:_authToken=${this.config.npmtoken}`,
        'utf8'
      );
    }

    writeFileSync(join(output, 'chaincode.config.json'),
      JSON.stringify({ controllers: this.chaincodeConfig.dump() }), 'utf8');
  }
}
