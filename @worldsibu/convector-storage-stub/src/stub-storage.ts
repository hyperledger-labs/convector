/** @module @worldsibu/convector-storage-stub */

import { ChaincodeStub } from 'fabric-shim';
import { BaseStorage, InvalidIdError } from '@worldsibu/convector-core';
import { StubHelper, Transform } from '@theledger/fabric-chaincode-utils';

// Remove when this gets merged
// https://github.com/wearetheledger/fabric-node-chaincode-utils/pull/23
Transform.isObject = data => data !== null && typeof data === 'object';

export class StubStorage extends BaseStorage {
  public stubHelper: StubHelper;

  constructor(stub: ChaincodeStub) {
    super();

    this.stubHelper = new StubHelper(stub);
  }

  public async query(query: any): Promise<any[]> {
    return await this.stubHelper.getQueryResultAsList(query);
  }

  /**
   * storageOptions parameter correspond to the StubHelper param
   * @see https://wearetheledger.github.io/fabric-node-chaincode-utils/modules/_models_getstateoptions_.html
   */
  public async get(id: string, storageOptions?: any): Promise<any> {
    InvalidIdError.test(id);
    return await this.stubHelper.getStateAsObject(id, storageOptions);
  }

  public async set(id: string, content: any, storageOptions?: any) {
    InvalidIdError.test(id);
    return await this.stubHelper.putState(id, JSON.stringify(content), storageOptions);
  }

  public async delete(id: string, storageOptions: any = {}) {
    InvalidIdError.test(id);

    if (storageOptions.privateCollection) {
      return await this.stubHelper.getStub()
        .deletePrivateData(storageOptions.privateCollection, id);
    }

    return await this.stubHelper.getStub().deleteState(id);
  }

  public async history(id: string): Promise<any[]> {
    InvalidIdError.test(id);
    return await this.stubHelper.getHistoryForKeyAsList(id);
  }
}
