/** @module convector-core-chaincode */

import { readFileSync } from 'fs';
import {
  ControllerImportError,
  ControllerMissingError,
  ConfigurationParseError,
  ConfigurationFileOpenError
} from '@worldsibu/convector-core-errors';

/** Model for the controller configuration */
export interface IConfig {
  /** npm package name */
  name: string;
  /** npm package version */
  version: string;
  /** named export of the controller class in the npm package */
  controller: string;
}

/** @hidden */
export type KV = { [k: string]: string };

/** @hidden */
export type Controller = { new (...args: any[]): any };

/** The default configuration path is `{CWD}/chaincode.config.json` */
const defaultPath = `${process.cwd()}/chaincode.config.json`;

/** Config helper class to abstract the configuration reading and parsing */
export class Config {
  /**
   * Static method to read and instantiate a Config object
   * based on a path to a config file definition
   *
   * @param path Path to the configuration
   */
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

  /**
   * Generate the necessary packages to install in the package.json
   * with the corresponding version
   */
  public getPackages(): KV {
    return this.config
      .reduce((result, config) => ({
        ...result,
        [config.name]: config.version
      }), {});
  }

  /**
   * Get a list of controller classes present in this configuration.
   * This means, import the modules and find the controller in the import result
   */
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

  /**
   * Return the raw configuration object
   */
  public dump() {
    return this.config;
  }
}
