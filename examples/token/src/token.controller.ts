/** @module @worldsibu/convector-examples-token */

import * as yup from 'yup';
import { ChaincodeTx } from '@worldsibu/convector-platform-fabric';
import {
  Controller,
  ConvectorController,
  Invokable,
  Param
} from '@worldsibu/convector-core';

import { Token, CompanyToken, Element } from './token.model';

@Controller('token')
export class TokenController extends ConvectorController<ChaincodeTx> {
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
    const token = await Token.getOne(tokenId);

    if (!token.id) {
      throw new Error(`No token found with id ${tokenId}`);
    }

    return token;
  }

  @Invokable()
  public async whoAmI(): Promise<string> {
    return this.sender;
  }

  @Invokable()
  public async failMe(): Promise<string> {
    throw new Error('Expected to fail');
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

  @Invokable()
  public async getIdentityInfo() {
    const mspId = this.tx.identity.getMSPID();
    const cert = this.tx.identity.getX509Certificate();
    const subject = cert.subject.commonName;
    const issuer = cert.issuer.commonName;

    return `Cert Fingerprint ${this.sender} for ${subject} (${mspId}) issued by ${issuer}`;
  }

  @Invokable()
  public async saveRecursive(
    @Param(Element)
    el: Element
  ) {
    await el.save();
  }
}
