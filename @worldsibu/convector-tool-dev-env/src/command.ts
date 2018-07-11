#!/usr/bin/env node
import { exec } from 'shelljs';
import { resolve, join } from 'path';
import * as program from 'commander';

import { Registry } from './registry';

const fixPath = p => resolve(process.cwd(), p);

const dockerEnv = {
  COMPOSE_PROJECT_NAME: 'net',
  FABRIC_VERSION: 'x86_64-1.1.0',
  THIRDPARTY_VERSION: 'x86_64-0.4.6'
};

const tasks = {
  async createRegistry(keyStore: string, networkProfile: string) {
    return await Registry.create({
      keyStore,
      networkProfile,
      txTimeout: 300000
    });
  },

  async addAdmin(
    registry: Registry,
    enrollmentID: string,
    enrollmentSecret: string,
    msp: string
  ) {
    return await registry.addAdmin({ enrollmentID, enrollmentSecret }, msp);
  },

  async addUser(
    registry: Registry,
    enrollmentID: string,
    affiliation: string,
    role: string,
    admin: string,
    msp: string
  ) {
    return await registry.addUser({ role, enrollmentID, affiliation, }, admin, msp);
  },

  dockerStart() {
    return exec(
      `docker-compose -f ${join(__dirname, '../docker-compose.yml')} up -d`,
      { silent: true, env: dockerEnv }
    );
  },

  dockerStop() {
    return exec(
      `docker-compose -f ${join(__dirname, '../docker-compose.yml')} down`,
      { silent: true, env: dockerEnv }
    );
  }
};

program
  .command('add-admin <username> <password> <msp>')
  .option('-k, --keystore <keystore>', 'Key store path', fixPath)
  .option('-p, --profile <profile>', 'Network profile path', fixPath)
  .action(async (enrollmentID: string, enrollmentSecret: string, msp: string, cmd: any) => {
    const registry = await tasks.createRegistry(cmd.keystore, cmd.profile);
    await tasks.addAdmin(registry, enrollmentID, enrollmentSecret, msp);
  });

program
  .command('add-user <username> <admin username> <msp>')
  .option('-a, --affiliation <affiliation>', 'User affiliation')
  .option('-r, --role <role>', 'User role')
  .option('-k, --keystore <keystore>', 'Key store path', fixPath)
  .option('-p, --profile <profile>', 'Network profile path', fixPath)
  .action(async (enrollmentID: string, admin: string, msp: string, cmd: any) => {
    const registry = await tasks.createRegistry(cmd.keystore, cmd.profile);
    await tasks.addUser(registry, enrollmentID, cmd.affiliation, cmd.role, admin, msp);
  });

program.parse(process.argv);
