import * as yup from 'yup';
import {
  Controller,
  ConvectorController,
  ConvectorModel,
  FlatConvectorModel,
  Invokable,
  Param,
  ReadOnly,
  Required,
  Validate
} from '@worldsibu/convector-core';

export class Second extends ConvectorModel<Second> {
  @ReadOnly()
  @Required()
  public readonly type = 'io.worldsibu.second';

  @Required()
  @Validate(yup.string())
  public name: string;
}


@Controller('second')
export class SecondController extends ConvectorController {
  @Invokable()
  public async init(@Param(Second) data: Second): Promise<void> {
    await data.save();
  }

  @Invokable()
  public async get(@Param(yup.string()) id: string): Promise<FlatConvectorModel<Second>> {
    return Second.getOne(id).then(m => m.toJSON()) as any;
  }
}
