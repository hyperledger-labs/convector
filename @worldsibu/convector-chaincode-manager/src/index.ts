import { dirname, join } from 'path';
import * as program from 'commander';
import { Config } from '@worldsibu/convector-chaincode';
import { readFileSync, writeFileSync } from 'fs';

import { Manager } from './manager';

const manager = new Manager();
const chaincodePath = dirname(require.resolve('@worldsibu/convector-chaincode'));

function prepare(extraPackages: any = {}, token: string) {
  const json = readFileSync(join(chaincodePath, '../../package.json'), 'utf8');

  const pkg = JSON.parse(json);

  delete pkg.watch;
  delete pkg.devDependencies;

  pkg.scripts = { start: pkg.scripts.start };
  pkg.dependencies = {
    ...pkg.dependencies,
    ...extraPackages
  };

  writeFileSync(join(chaincodePath, 'package.json'), JSON.stringify(pkg), 'utf8');
  writeFileSync(join(chaincodePath, '.npmrc'), `//registry.npmjs.org/:_authToken=${token}`, {
    encoding: 'utf8',
    flag: 'w'
  });
}

program
  .command('install <name> <version>')
  .option('-c, --config <config>', 'Configuration path', path => join(process.cwd(), path))
  .action(async (name: string, version: string, cmd: any) => {
    const managerConfig = Manager.readConfig(cmd.config);
    const chaincodeConfig = new Config(managerConfig.controllers);
    prepare(chaincodeConfig.getPackages(), managerConfig.worldsibuNpmToken);

    await manager.init(managerConfig);
    await manager.install(name, version, chaincodePath);
    await manager.instantiate(name, version);
    await manager.invoke(name, 'initControllers', undefined, JSON.stringify(chaincodeConfig.dump()));
  });

program
  .command('upgrade <name> <version>')
  .option('-c, --config <config>', 'Configuration path', path => join(process.cwd(), path))
  .action(async (name: string, version: string, cmd: any) => {
    const managerConfig = Manager.readConfig(cmd.config);
    const chaincodeConfig = new Config(managerConfig.controllers);
    prepare(chaincodeConfig.getPackages(), managerConfig.worldsibuNpmToken);

    await manager.init(managerConfig);
    await manager.install(name, version, chaincodePath);
    await manager.upgrade(name, version);
    await manager.invoke(name, 'initControllers', undefined, JSON.stringify(chaincodeConfig.dump()));
  });

program
  .command('invoke <name> <controller> <fn> [args...]')
  .option('-u, --user <user>', 'Send the transaction with the specified enrolled user')
  .option('-c, --config <config>', 'Configuration path', path => join(process.cwd(), path))
  .action(async (name: string, controller: string, fn: string, args: string[], cmd: any) => {
    const managerConfig = Manager.readConfig(cmd.config);
    const chaincodeConfig = new Config(managerConfig.controllers);
    prepare(chaincodeConfig.getPackages(), managerConfig.worldsibuNpmToken);

    await manager.init(managerConfig);
    await manager.invoke(name, `${controller}_${fn}`, cmd.user, ...args);
  });

program.parse(process.argv);
