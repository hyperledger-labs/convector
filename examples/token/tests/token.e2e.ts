// tslint:disable:no-unused-expression

import { expect } from 'chai';
import { resolve } from 'path';
import * as uuid from 'uuid/v4';
import 'mocha';

import { CouchDBStorage } from '@worldsibu/convector-storage-couchdb';
import { FabricControllerAdapter, ClientHelper } from '@worldsibu/convector-platform-fabric';
import { BaseStorage, ClientFactory, ConvectorControllerClient } from '@worldsibu/convector-core';

import { Token } from '../src/token.model';
import { TokenController } from '../src/token.controller';

describe('Token e2e', () => {
  let tokenId: string;
  let adapter: FabricControllerAdapter;
  let tokenCtrl: ConvectorControllerClient<TokenController>;

  const totalSupply = 1000000;
  // Mock certificate fingerprint
  let certificate: string;

  before(async () => {
    const keyStore = resolve(__dirname, '../../../.convector-dev-env/.hfc-org1');
    const networkProfile = resolve(__dirname, '../../../.convector-dev-env',
      'network-profiles/org1.network-profile.yaml');
    const userMspPath = resolve(__dirname, '../../../.convector-dev-env',
      'artifacts/crypto-config/peerOrganizations/org1.hurley.lab/users/Admin@org1.hurley.lab/msp');

    tokenId = uuid();
    adapter = new FabricControllerAdapter({
      txTimeout: 300000,
      user: 'admin',
      channel: 'ch1',
      chaincode: 'token1',
      keyStore,
      networkProfile,
      userMspPath,
      // userMsp: 'org1MSP'
    });
    tokenCtrl = ClientFactory(TokenController, adapter);

    BaseStorage.current = new CouchDBStorage({
      host: 'localhost',
      protocol: 'http',
      port: '5084'
    }, 'ch1_token1');

    await adapter.init();

    certificate = await tokenCtrl.whoAmI();
  });

  after(() => {
    (adapter as ClientHelper).close();
  });

  it('should initialize the token', async () => {
    await tokenCtrl.init(new Token({
      id: tokenId,
      name: 'Token',
      symbol: 'TKN',
      totalSupply: totalSupply,
      balances: { [certificate]: totalSupply },
      complex: {
        name: 'Test',
        value: 5
      }
    }));

    const token = await Token.getOne(tokenId);

    expect(token).to.exist;
    expect(token.complex.name).to.eq('Test');
    expect(token.balances[certificate]).to.eq(totalSupply);
  });

  it('should transfer tokens', async () => {
    await tokenCtrl.transfer(tokenId, 'burn-zone', 500000);

    const token = await Token.getOne(tokenId);

    expect(token.balances[certificate]).to.eq(500000);
  });

  it('should fail expectedly', async () => {
    try {
      await tokenCtrl.failMe();
    } catch (error) {
      expect(error.responses).to.exist;
      expect(error.responses).to.be.of.lengthOf(2);
      expect(error.responses[0].error.message).to.eql('Expected to fail');
    }
  });

  it('should retrieve a token', async () => {
    const token = await tokenCtrl.get(tokenId);
    expect(token.balances[certificate]).to.eq(500000);
  });

  it('should be able to access the identity in the controller', async () => {
    const info = await tokenCtrl.getIdentityInfo();

    console.log(info);

    expect(info).to.exist;
  });

  it('should return the raw response', async () => {
    const response: any = await tokenCtrl.$raw().getIdentityInfo();

    console.log(response);

    expect(response.txId).to.exist;
  });

  it('should preserve the context in parallel invokes', async () => {
    await Array(10).fill('').reduce(async (result, _, n) => {
      await result;
      console.log(`Processing batch ${n+1}/10`);
      await Promise.all(Array(10).fill('').map(async (_, m) => {
        console.log(`Processing item ${m+1}/10`);
        await tokenCtrl.init(new Token({
          id: uuid(),
          name: 'Token',
          symbol: 'TKN',
          totalSupply: totalSupply,
          balances: { [certificate]: totalSupply },
          complex: {
            name: 'Test',
            value: 5
          }
        }));
      }));
    });
  });
});
