// tslint:disable:no-unused-expression

import { expect } from 'chai';
import { resolve } from 'path';
import * as uuid from 'uuid/v4';
import { BaseStorage } from '@worldsibu/convector-core-storage';
import { CouchDBStorage } from '@worldsibu/convector-storage-couchdb';
import { FabricControllerAdapter } from '@worldsibu/convector-adapter-fabric';
import 'mocha';

import { Token } from '../src/token.model';
import { TokenControllerClient } from '../client';

describe('Token e2e', () => {
  let tokenId: string;
  let adapter: FabricControllerAdapter;
  let tokenCtrl: TokenControllerClient;

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
    tokenCtrl = new TokenControllerClient(adapter);

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
      balances: { [certificate]: totalSupply }
    }));

    const token = await Token.getOne(tokenId);

    expect(token).to.exist;
    expect(token.balances[certificate]).to.eq(totalSupply);
  });

  it('should transfer tokens', async () => {
    await tokenCtrl.transfer(tokenId, 'burn-zone', 500000);

    const token = await Token.getOne(tokenId);

    expect(token.balances[certificate]).to.eq(500000);
  });
});
