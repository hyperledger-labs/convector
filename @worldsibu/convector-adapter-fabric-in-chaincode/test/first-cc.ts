import * as yup from 'yup';
import {
  Controller,
  ConvectorController,
  Invokable,
  Param,
  ClientFactory,
  FlatConvectorModel
} from '@worldsibu/convector-core';

import { Third } from './third-cc';
import { SecondController, Second } from './second-cc';
import { InChaincodeAdapter } from '../src/fabric-in-chaincode.controller-adapter';

const adapter = new InChaincodeAdapter();
const secondCtrl = ClientFactory(SecondController, adapter);

@Controller('first')
export class FirstController extends ConvectorController {
  @Invokable()
  public async connectToSecond(
    @Param(yup.string())
    id: string,
    @Param(yup.string())
    channel: string,
    @Param(yup.string())
    chaincode: string
  ): Promise<FlatConvectorModel<Second>> {
    // Cross invoke the chaincode and return what it returns
    // Do this when you have the source code of the external chaincode
    const second = await secondCtrl.$config({ tx: this.tx, channel, chaincode }).get(id);
    // Save the external model in this ledger
    await new Second({id: `second:${id}`, ...second}).save();

    // Return the model
    return second;
  }

  @Invokable()
  public async connectToThird(
    @Param(yup.string())
    id: string,
    @Param(yup.string())
    channel: string,
    @Param(yup.string())
    chaincode: string
  ): Promise<FlatConvectorModel<Third>> {
    // Cross invoke the chaincode and return what it returns
    // Do this when you DON'T have the chaincode sourcecode, all you need is the name of the fn
    const third = await adapter.rawInvoke('third_get', { tx: this.tx, channel, chaincode }, '1');

    // Save the external model in this ledger
    await new Third({id: `third:${id}`, ...third}).save();

    // Return the model
    return third;
  }
}
