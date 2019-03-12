// tslint:disable:no-unused-expression

import { expect } from 'chai';
import { resolve } from 'path';
import * as uuid from 'uuid/v4';
import 'mocha';

import { CouchDBStorage } from '@worldsibu/convector-storage-couchdb';
import { FabricControllerAdapter } from '@worldsibu/convector-platform-fabric';
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
    const keystore = '../../../.convector-dev-env/.hfc-org1';
    const networkProfile = './orgs/org1.network-profile.yaml';

    tokenId = uuid();
    adapter = new FabricControllerAdapter({
      txTimeout: 300000,
      user: 'user1',
      channel: 'ch1',
      chaincode: 'convector',
      keyStore: resolve(__dirname, keystore),
      networkProfile: resolve(__dirname, networkProfile),
      userMspPath: keystore
    });
    tokenCtrl = ClientFactory(TokenController, adapter);

    BaseStorage.current = new CouchDBStorage({
      host: 'localhost',
      protocol: 'http',
      port: '5984'
    }, 'ch1_convector');

    await adapter.init();

    certificate = await tokenCtrl.whoAmI();
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

  it('should retrieve a token', async () => {
    const token = await tokenCtrl.get(tokenId);
    expect(token.balances[certificate]).to.eq(500000);
  });

  it('should be able to access the identity in the controller', async () => {
    const info = await tokenCtrl.getIdentityInfo();

    console.log(info);

    expect(info).to.exist;
  });
});
