#!/usr/bin/env node
import { resolve } from 'path';
import * as program from 'commander';

import { Manager } from './manager';

program
  .command('package')
  .option('-o, --output <path>', 'Output directory', path => resolve(process.cwd(), path))
  .option('-c, --config <path>', 'Configuration path', path => resolve(process.cwd(), path))
  .option('-u, --update', 'Update the content instead of replace it')
  .action(async (cmd: any) => {
    const manager = Manager.fromConfig(cmd.config);

    await manager.package(cmd.output, undefined, cmd.update);
  });

program
  .command('install <path> <name> <version>')
  .option('-c, --config <path>', 'Configuration path', path => resolve(process.cwd(), path))
  .action(async (path: string, name: string, version: string, cmd: any) => {
    const manager = Manager.fromConfig(cmd.config);

    await manager.init();
    await manager.install(name, version, path);
  });

program
  .command('instantiate <name> <version>')
  .option('-c, --config <path>', 'Configuration path', path => resolve(process.cwd(), path))
  .action(async (name: string, version: string, cmd: any) => {
    const manager = Manager.fromConfig(cmd.config);

    await manager.init();
    await manager.instantiate(name, version);
    await manager.initControllers(name);
  });

program
  .command('upgrade <name> <version>')
  .option('-c, --config <path>', 'Configuration path', path => resolve(process.cwd(), path))
  .action(async (name: string, version: string, cmd: any) => {
    const manager = Manager.fromConfig(cmd.config);

    await manager.init();
    await manager.upgrade(name, version);
    await manager.initControllers(name);
  });

program
  .command('invoke <name> <controller> <fn> [args...]')
  .option('-u, --user <user>', 'Send the transaction with the specified enrolled user')
  .option('-c, --config <path>', 'Configuration path', path => resolve(process.cwd(), path))
  .action(async (name: string, controller: string, fn: string, args: string[], cmd: any) => {
    const manager = Manager.fromConfig(cmd.config);

    await manager.init();
    await manager.invoke(`${controller}_${fn}`, name, cmd.user, ...args);
  });

program.parse(process.argv);
