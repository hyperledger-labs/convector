/** @module @worldsibu/convector-examples-token */

import * as yup from 'yup';
import {
  ConvectorModel,
  ReadOnly,
  Required,
  Validate,
  FlatConvectorModel,
  Default
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

export class TokenBase<T extends TokenBase<any>> extends ConvectorModel<T> {
  @ReadOnly()
  @Default('io.worldsibu.examples.token-base')
  public readonly type: string;

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

export class Token<T extends Token<any>> extends TokenBase<T> {
  @ReadOnly()
  @Default('io.worldsibu.examples.token')
  public readonly type: string;
}

export class CompanyToken extends Token<CompanyToken> {
  @ReadOnly()
  @Default('io.company.tkn')
  public readonly type: string;
}

export class Element<T extends Element<any>=Element<any>> extends ConvectorModel<T> {
  @Default('io.example.element')
  @Required()
  public readonly type: string;

  @Validate(yup.lazy(() => SubElement.schema()))
  public ref?: FlatConvectorModel<SubElement>;
}

export class SubElement extends Element<SubElement> {
  @Default('io.example.element.subElement')
  @Required()
  public readonly type: string;

  @Validate(yup.string())
  public test: string;
}
