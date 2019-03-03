// tslint:disable:no-unused-expression

import { expect } from 'chai';
import 'mocha';
import 'reflect-metadata';
import {
  ConvectorController,
  Controller,
  Invokable
} from '@worldsibu/convector-core-controller';

import { ClientFactory } from '../src/controller-client';
import { ControllerAdapter } from '../src/controller-adapter';

@Controller('test')
class TestController extends ConvectorController {
  @Invokable()
  public async test() {
    return 'works';
  }
}

class TestAdapter implements ControllerAdapter {
  private ctrl: ConvectorController;

  constructor(ctrl: new () => ConvectorController) {
    this.ctrl = new ctrl();
  }

  async invoke(controller, name, user, ...args) {
    return this.ctrl[name]({}, args, {});
  }
}

describe('Controller Client', () => {
  it('it should generate a client with an adapter', async () => {
    const adapter = new TestAdapter(TestController);
    const testCtrl = ClientFactory(TestController, adapter);

    expect(await testCtrl.test()).to.eq('works');
  });
});
