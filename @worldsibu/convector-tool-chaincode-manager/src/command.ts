import { join } from 'path';
import * as program from 'commander';

import { Manager } from './manager';

program
  .command('install <name> <version>')
  .option('-c, --config <config>', 'Configuration path', path => join(process.cwd(), path))
  .action(async (name: string, version: string, cmd: any) => {
    console.log(cmd.config);
    const manager = Manager.fromConfig(cmd.config);

    await manager.init();
    await manager.install(name, version);
    await manager.instantiate(name, version);
    await manager.initControllers(name);
  });

program
  .command('upgrade <name> <version>')
  .option('-c, --config <config>', 'Configuration path', path => join(process.cwd(), path))
  .action(async (name: string, version: string, cmd: any) => {
    const manager = Manager.fromConfig(cmd.config);

    await manager.init();
    await manager.install(name, version);
    await manager.upgrade(name, version);
    await manager.initControllers(name);
  });

program
  .command('invoke <name> <controller> <fn> [args...]')
  .option('-u, --user <user>', 'Send the transaction with the specified enrolled user')
  .option('-c, --config <config>', 'Configuration path', path => join(process.cwd(), path))
  .action(async (name: string, controller: string, fn: string, args: string[], cmd: any) => {
    const manager = Manager.fromConfig(cmd.config);

    await manager.init();
    await manager.invoke(name, `${controller}_${fn}`, cmd.user, ...args);
  });

program.parse(process.argv);
