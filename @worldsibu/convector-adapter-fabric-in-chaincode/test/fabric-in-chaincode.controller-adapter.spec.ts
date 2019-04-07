// tslint:disable:no-unused-expression

import { join } from 'path';
import { expect } from 'chai';
import 'mocha';
import 'reflect-metadata';

import { MockControllerAdapter } from '@worldsibu/convector-adapter-mock';
import { ConvectorControllerClient, ClientFactory } from '@worldsibu/convector-core';

import { FirstController } from './first-cc';
import { SecondController, Second } from './second-cc';
import { ThirdController, Third } from './third-cc';

describe('In Chaincode Controller Adapter', () => {
  let firstAdapter: MockControllerAdapter;
  let firstCtrl: ConvectorControllerClient<FirstController>;

  let secondAdapter: MockControllerAdapter;
  let secondCtrl: ConvectorControllerClient<SecondController>;

  let thirdAdapter: MockControllerAdapter;
  let thirdCtrl: ConvectorControllerClient<ThirdController>;

  before(async () => {
    firstAdapter = new MockControllerAdapter();
    firstCtrl = ClientFactory(FirstController, firstAdapter);
    await firstAdapter.init([
      {
        version: '*',
        controller: 'FirstController',
        name: join(__dirname, 'first-cc')
      }
    ]);

    secondAdapter = new MockControllerAdapter();
    secondCtrl = ClientFactory(SecondController, secondAdapter);
    await secondAdapter.init([
      {
        version: '*',
        controller: 'SecondController',
        name: join(__dirname, 'second-cc')
      }
    ]);

    thirdAdapter = new MockControllerAdapter();
    thirdCtrl = ClientFactory(ThirdController, thirdAdapter);
    await thirdAdapter.init([
      {
        version: '*',
        controller: 'ThirdController',
        name: join(__dirname, 'third-cc')
      }
    ]);

    firstAdapter.stub.mockPeerChaincode('second/ch1', secondAdapter.stub);
    firstAdapter.stub.mockPeerChaincode('third/ch1', thirdAdapter.stub);
  });

  it('it should invoke a function in another chaincode when you have the source code', async () => {
    // Write in second and third chaincodes
    // Even tho they have the same id, they are different chaincodes, so they won't override
    await secondCtrl.init(new Second({
      id: '1',
      name: 'Casa'
    }));

    const second = await firstCtrl.connectToSecond('1', 'ch1', 'second');
    expect(second.name).to.eql('Casa');
  });

  it('it should invoke a function in another chaincode when you don\'t have the source code', async () => {
    await thirdCtrl.init(new Third({
      id: '1',
      name: 'Casita'
    }));

    const third = await firstCtrl.connectToThird('1', 'ch1', 'third');
    expect(third.name).to.eql('Casita');
  });
});
