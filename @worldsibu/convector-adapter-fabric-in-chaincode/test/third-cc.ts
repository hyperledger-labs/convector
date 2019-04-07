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

export class Third extends ConvectorModel<Third> {
  @ReadOnly()
  @Required()
  public readonly type = 'io.worldsibu.third';

  @Required()
  @Validate(yup.string())
  public name: string;
}


@Controller('third')
export class ThirdController extends ConvectorController {
  @Invokable()
  public async init(@Param(Third) data: Third): Promise<void> {
    await data.save();
  }

  @Invokable()
  public async get(@Param(yup.string()) id: string): Promise<FlatConvectorModel<Third>> {
    return Third.getOne(id).then(m => m.toJSON()) as any;
  }
}
