/** @module @worldsibu/convector-storage-couchdb */

import * as CouchDB from 'node-couchdb';
import { InvalidIdError } from '@worldsibu/convector-core-errors';
import { BaseStorage } from '@worldsibu/convector-core-storage';

export class CouchDBStorage extends BaseStorage {
  private couch: any;

  constructor(config: any, public defaultDB?: string) {
    super();

    this.couch = new CouchDB(config);
  }

  public updateDefaultDB(defaultDB: string) {
    this.defaultDB = defaultDB;
  }

  public async query(...args: any[]): Promise<any[]> {
    let db = this.defaultDB;

    if (args.length > 1) {
      db = args.shift();
    }

    const result = await this.couch.get(db, ...args);

    if (result) {
      if (result.docs) {
        return result.docs;
      }

      if (result.data && Array.isArray(result.data.rows)) {
        return result.data.rows.map(data => data.value);
      }
    }

    return [];
  }

  public async get(id: string): Promise<any> {
    InvalidIdError.test(id);
    const result = await this.couch.get(this.defaultDB, id);
    return result.data;
  }

  public async set(id: string, content: any) {
    throw new Error('The method `set` in the CouchDB storage is not supported');
  }

  public async delete(id: string) {
    throw new Error('The method `delete` in the CouchDB storage is not supported');
  }
}
