/** @module @worldsibu/convector-examples-token */

import * as yup from 'yup';
import {
  ConvectorModel,
  ReadOnly,
  Required,
  Validate,
  FlatConvectorModel
} from '@worldsibu/convector-core-model';

export class Complex extends ConvectorModel<Complex> {
  @ReadOnly()
  public readonly type = 'io.worldsibu.examples.complex';

  @Required()
  @Validate(yup.mixed())
  public value: any;

  @Required()
  @Validate(yup.string())
  public name: string;
}

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

  @Required()
  @Validate(Complex)
  public complex: FlatConvectorModel<Complex>;
}
