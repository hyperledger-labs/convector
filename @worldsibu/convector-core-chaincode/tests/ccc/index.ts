import * as yup from 'yup';
import { ConvectorController, Controller, Invokable } from '@worldsibu/convector-core';

import { ChaincodeTx } from '../..';

@Controller('test')
export class TestController extends ConvectorController<ChaincodeTx> {
  @Invokable()
  public async test() {
    // EMPTY
  }

  @Invokable()
  public async testTransient() {
    return this.tx.getTransientValue('test', yup.string());
  }
}
