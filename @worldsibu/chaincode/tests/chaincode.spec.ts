// tslint:disable:no-unused-expression

import { expect } from 'chai';
import * as uuid from 'uuid/v1';
import { Organization  } from  '@worldsibu/tellus-organization-ccm';
import { ChaincodeMockStub, Transform } from '@theledger/fabric-mock-stub';
import 'mocha';

import { Config } from '../src/config';
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
            name: '@worldsibu/tellus-organization-ccc',
            version: '0.0.1',
            controller: 'OrganizationController'
          }
        ])
      ]);

      expect(response.status).to.eql(200);
    });

    it('should create an organization', async () => {
      const id = 'Sibu';

      await stub.mockInvoke(uuid(), [
        'organization_create',
        JSON.stringify(new Organization({ id, name: id }))
      ]);
      const response = await stub.getState(id);

      expect(Transform.bufferToObject(response))
        .to.include({ id, name: id } as Organization);
    });
  });
});
