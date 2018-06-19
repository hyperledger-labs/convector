import * as yup from 'yup';
import {
  ConvectorModel,
  Default,
  ReadOnly,
  Required,
  Validate
} from '@worldsibu/convector-model';

export class Token extends ConvectorModel<Token> {
  @ReadOnly()
  public readonly type = 'io.worldsibu.examples.token';

  @ReadOnly()
  @Required()
  @Validate(yup.object())
  public balances: { [key: string]: number };

  @ReadOnly()
  @Required()
  @Validate(yup.number().moreThan(0))
  public totalSupply: number;

  @ReadOnly()
  @Required()
  @Validate(yup.string())
  public name: string;

  @ReadOnly()
  @Required()
  @Validate(yup.string())
  public symbol: string;
}
