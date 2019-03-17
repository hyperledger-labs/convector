// tslint:disable:no-unused-expression

import { expect } from 'chai';
import 'mocha';
import 'reflect-metadata';

import { ConvectorController, Controller, Invokable } from '@worldsibu/convector-core';

import { BrowserControllerAdapter } from '../src/browser.controller-adapter';

@Controller('test')
class TestController extends ConvectorController {
  @Invokable()
  public async test() {
    return 'works';
  }
}

describe('Browser Controller Adapter', () => {
  it('it should invoke a function in the controller', async () => {
    const adapter = new BrowserControllerAdapter();
    adapter.init([TestController]);

    expect(await adapter.invoke('test', 'test')).to.eq('works');
  });
});
