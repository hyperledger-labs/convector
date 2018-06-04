import { readFileSync } from 'fs';

export interface IConfig {
  name: string;
  version: string;
  controller: string;
}

export type KV = { [k: string]: string };
export type Controller = { new (...args: any[]): any };

const defaultPath = `${process.cwd()}/tellus-chaincode.config.json`;

export class Config {
  public static readFromFile(path: string = defaultPath) {
    let config = {
      controllers: []
    };

    try {
      config = JSON.parse(readFileSync(path, 'utf8'));
    } catch (e) {
      throw new Error('Unable to read or parse the configuration file');
    }

    return new Config(config.controllers);
  }

  constructor(private config: IConfig[]) { }

  public getPackages(): KV {
    return this.config
      .reduce((result, config) => ({
        ...result,
        [config.name]: config.version
      }), {});
  }

  public async getControllers(): Promise<Controller[]> {
    const controllers = this.config
      .map(async config => (await import(config.name))[config.controller]);

    return Promise.all(controllers);
  }

  public dump() {
    return this.config;
  }
}
