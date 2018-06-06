import { BaseStorage } from '@worldsibu/chaincode-base-storage';
import { ensureRequired, getDefaults } from '@worldsibu/chaincode-utils';
import { InvalidIdError } from '@worldsibu/chaincode-errors';

export abstract class ChaincodeModel<T extends ChaincodeModel<any>> {
  public id: string;
  public abstract readonly type: string;

  constructor();
  constructor(id: string);
  constructor(content: { [key in keyof T]?: T[key] });
  constructor(content?: string|{ [key in keyof T]?: T[key] }) {
    if (!content) {
      return;
    }

    if (typeof content === 'string') {
      this.id = content;
      return;
    }

    this.assign(content);
  }

  public async update(content: { [key in keyof T]?: T[key] }) {
    this.assign(content);
    await this.save();
  }

  public async fetch() {
    const content = await BaseStorage.current.get(this.id) as ChaincodeModel<T>;

    if (content.type !== this.type) {
      throw new Error(`Possible ID collision, element ${this.id} of type ${content.type} is not ${this.type}`);
    }

    this.assign(content as T);
  }

  public async save() {
    this.assign(getDefaults(this));
    if (!ensureRequired(this)) {
      throw new Error('Model is not complete');
    }

    InvalidIdError.test(this.id);
    await BaseStorage.current.set(this.id, this);
  }

  public clone(): T {
    return Object.assign({}, this) as any;
  }

  public toJSON() {
    const proto = Object.getPrototypeOf(this);

    const base = Object.keys(this)
      .filter(k => !k.startsWith('_'))
      .reduce((result, key) => ({...result, [key]: this[key]}), {});

    return Object.keys(proto)
      .reduce((result, key) => {
        const desc = Object.getOwnPropertyDescriptor(proto, key);
        const hasGetter = desc && typeof desc.get === 'function';

        if (hasGetter) {
          result[key] = desc.get.call(this);
        }

        return result;
      }, base);
  }

  public async delete() {
    await BaseStorage.current.delete(this.id);
  }

  private assign(content: { [key in keyof T]?: T[key] }) {
    Object.assign(this, content);
  }
}
