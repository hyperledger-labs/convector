// tslint:disable:no-unused-expression

import { join } from 'path';
import { expect } from 'chai';
import * as uuid from 'uuid/v4';
import { MockControllerAdapter } from '@worldsibu/convector-adapter-mock';
import 'mocha';

import { Token } from '../src/token.model';
import { TokenControllerClient } from '../client';

describe('Token', () => {
  let tokenId: string;
  let adapter: MockControllerAdapter;
  let tokenCtrl: TokenControllerClient;

  const totalSupply = 1000000;
  // Mock certificate fingerprint
  const certificate = 'B6:0B:37:7C:DF:D2:7A:08:0B:98:BF:52:A4:2C:DC:4E:CC:70:91:E1';

  before(async () => {
    tokenId = uuid();
    adapter = new MockControllerAdapter();
    tokenCtrl = new TokenControllerClient(adapter);

    await adapter.init([
      {
        version: '*',
        controller: 'TokenController',
        name: join(__dirname, '..')
      }
    ]);
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

    const token = await adapter.getById<Token>(tokenId);

    expect(token).to.exist;
    expect(token.complex.name).to.eq('Test');
    expect(token.balances[certificate]).to.eq(totalSupply);
  });

  it('should transfer tokens', async () => {
    await tokenCtrl.transfer(tokenId, 'burn-zone', 500000);

    const token = await adapter.getById<Token>(tokenId);

    expect(token.balances[certificate]).to.eq(500000);
  });

  it('should fail to create a new model if any sub model is missing', async () => {
    await tokenCtrl.init(new Token({
      id: tokenId + 1,
      name: 'Token',
      symbol: 'TKN',
      totalSupply: totalSupply,
      balances: { [certificate]: totalSupply }
    }));

    console.log('Expected error in unit-test');
    const token = await adapter.getById<Token>(tokenId + 1);

    expect(token).to.not.exist;
  });
});
