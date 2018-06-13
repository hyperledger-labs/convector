import { readFileSync } from 'fs';
import {
  ControllerImportError,
  ControllerMissingError,
  ConfigurationParseError,
  ConfigurationFileOpenError
} from '@worldsibu/chaincode-errors';

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

    let fileContent: string;

    try {
      fileContent = readFileSync(path, 'utf8');
    } catch (e) {
      throw new ConfigurationFileOpenError(e, path);
    }

    try {
      config = JSON.parse(fileContent);
    } catch (e) {
      throw new ConfigurationParseError(e, fileContent);
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
      .map(async config => {
        const pkg = await import(config.name)
          .catch(e => { throw new ControllerImportError(e, config.name); });

        const ctrl = pkg[config.controller];

        if (!ctrl) {
          throw new ControllerMissingError(config.name, config.controller);
        }

        return ctrl;
      });

    return Promise.all(controllers);
  }

  public dump() {
    return this.config;
  }
}
