// tslint:disable:no-unused-expression

import { join } from 'path';
import { expect } from 'chai';
import * as uuid from 'uuid/v1';
import { ChaincodeMockStub } from '@theledger/fabric-mock-stub';
import 'mocha';

import { Chaincode } from '../src/chaincode';

describe('Generic Chaincode', () => {
  describe('session 1', () => {
    // The chaincode storage will be the same in this session
    const stub = new ChaincodeMockStub('Chaincode', new Chaincode());

    it('should init without issues', async () => {
      await stub.mockInit(uuid(), []);
      const response = await stub.mockInvoke(uuid(), [
        'initControllers',
        JSON.stringify([
          {
            name: join(__dirname, './ccc'),
            version: '0.0.1',
            controller: 'TestController'
          }
        ])
      ]);

      expect(response.status).to.eql(200);
    });

    it('should invoke a controller', async () => {
      const id = 'Sibu';

      const response = await stub.mockInvoke(uuid(), ['test_test']);

      expect(response.status).to.eql(200);
    });
  });
});
