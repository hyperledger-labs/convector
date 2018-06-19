import * as yup from 'yup';
import {
  Controller,
  ConvectorController,
  Invokable,
  Param
} from '@worldsibu/convector-controller';

import { Token } from './token.model';

@Controller('token')
export class TokenController extends ConvectorController {
  private initialized = false;

  @Invokable()
  public async init(
    @Param(Token)
    token: Token
  ) {
    if (this.initialized) {
      throw new Error('Token has already been initialized');
    }

    const totalSupply = Object.keys(token.balances)
      .reduce((total, fingerprint) => total + token.balances[fingerprint], 0);

    if (totalSupply !== token.totalSupply) {
      throw new Error('The total supply does not match with the initial balances');
    }

    await token.save();
  }

  @Invokable()
  public async transfer(
    @Param(yup.string())
    tokenId: string,
    @Param(yup.string())
    to: string,
    @Param(yup.number().moreThan(0))
    amount: number
  ) {
    const token = await Token.getOne(tokenId);

    if (token.balances[this.sender] < amount) {
      throw new Error('The sender does not have enough founds');
    }

    token.balances[to] += amount;
    token.balances[this.sender] -= amount;

    await token.save();
  }
}
