/** @module @worldsibu/convector-storage-stub */

import { Stub } from 'fabric-shim';
import { InvalidIdError } from '@worldsibu/convector-core-errors';
import { StubHelper } from '@theledger/fabric-chaincode-utils';
import { BaseStorage } from '@worldsibu/convector-core-storage';

export class StubStorage extends BaseStorage {
  private stubHelper: StubHelper;

  constructor(stub: Stub) {
    super();

    this.stubHelper = new StubHelper(stub);
  }

  public async query(query: any): Promise<any[]> {
    return await this.stubHelper.getQueryResultAsList(query);
  }

  public async get(id: string): Promise<any> {
    InvalidIdError.test(id);
    return await this.stubHelper.getStateAsObject(id);
  }

  public async set(id: string, content: any) {
    InvalidIdError.test(id);
    return await this.stubHelper.putState(id, JSON.stringify(content));
  }

  public async delete(id: string) {
    InvalidIdError.test(id);
    return await this.stubHelper.getStub().deleteState(id);
  }

  public async history(id: string): Promise<any[]> {
    InvalidIdError.test(id);
    return await this.stubHelper.getHistoryForKeyAsList(id);
  }
}
