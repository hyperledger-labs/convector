/** @module @worldsibu/convector-examples-token */

import * as yup from 'yup';
import {
  Controller,
  ConvectorController,
  Invokable,
  Param
} from '@worldsibu/convector-core-controller';

import { Token, CompanyToken } from './token.model';

@Controller('token')
export class TokenController extends ConvectorController {
  @Invokable()
  public async init(
    @Param(Token)
    token: Token<any>
  ) {
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

    if (!token.id) {
      throw new Error(`No token found with id ${tokenId}`);
    }

    console.log('Using token id', token.id);

    if (token.balances[this.sender] < amount) {
      throw new Error('The sender does not have enough founds');
    }

    token.balances[to] += amount;
    token.balances[this.sender] -= amount;

    await token.save();
  }

  @Invokable()
  public async get(
    @Param(yup.string())
    tokenId: string
  ) {
    return (await Token.getOne(tokenId)).toJSON();
  }

  @Invokable()
  public async whoAmI(): Promise<string> {
    return this.sender;
  }

  @Invokable()
  public async createCompanyToken(
    @Param(CompanyToken)
    token: CompanyToken
  ) {
    const totalSupply = Object.keys(token.balances)
      .reduce((total, fingerprint) => total + token.balances[fingerprint], 0);

    if (totalSupply !== token.totalSupply) {
      throw new Error('The total supply does not match with the initial balances');
    }

    await token.save();
  }
}
