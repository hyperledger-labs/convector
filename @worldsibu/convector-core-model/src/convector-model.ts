import * as yup from 'yup';
import { InvalidIdError } from '@worldsibu/convector-core-errors';
import { BaseStorage } from '@worldsibu/convector-core-storage';

import { Validate } from '../src/validate.decorator';
import { getDefaults } from '../src/default.decorator';
import { getValidatedProperties } from '../src/validate.decorator';
import { Required, ensureRequired } from '../src/required.decorator';

export abstract class ConvectorModel<T extends ConvectorModel<any>> {
  public static async getOne<T extends ConvectorModel<any>>(
    this: new (content: any) => T,
    id: string,
    type?: new (content: any) => T
  ): Promise<T> {
    type = type || this;
    const content = await BaseStorage.current.get(id);
    return new type(content);
  }

  public static async query<T>(type: new (content: any) => T, ...args: any[]): Promise<T|T[]>;
  public static async query<T>(this: new (content: any) => T, ...args: any[]): Promise<T|T[]> {
    let type = this;

    // Stupid horrible hack to find the current implementation's parent type
    if (args[0] && args[0].prototype.__proto__.constructor === ConvectorModel) {
      type = args.shift();
    }

    const content = await BaseStorage.current.query(...args);
    return Array.isArray(content) ? content.map(c => new type(c)) : new type(content);
  }

  public static async getAll<T extends ConvectorModel<any>>(
    this: new (content: any) => T,
    type?: string
  ): Promise<T[]> {
    type = type || new this('').type;
    return await ConvectorModel.query(this, { selector: { type } }) as T[];
  }

  @Required()
  @Validate(yup.string())
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
    const content = await BaseStorage.current.get(this.id) as ConvectorModel<T>;

    if (content.type !== this.type) {
      throw new Error(`Possible ID collision, element ${this.id} of type ${content.type} is not ${this.type}`);
    }

    this.assign(content as T);
  }

  public async save() {
    this.assign(getDefaults(this), true);
    if (!ensureRequired(this)) {
      throw new Error(`Model ${this.type} is not complete\n${this.toJSON()}`);
    }

    InvalidIdError.test(this.id);
    await BaseStorage.current.set(this.id, this);
  }

  public clone(): T {
    return Object.assign({}, this) as any;
  }

  public toJSON(skipEmpty = false): { [key in keyof T]?: T[key] } {
    const proto = Object.getPrototypeOf(this);

    const base = Object.keys(this).concat('id')
      .filter(k => !k.startsWith('_'))
      .filter(k => !skipEmpty || this[k] !== undefined || this[k] !== null)
      .reduce((result, key) => ({...result, [key]: this[key]}), {});

    return Object.keys(proto)
      .reduce((result, key) => {
        const desc = Object.getOwnPropertyDescriptor(proto, key);
        const hasGetter = desc && typeof desc.get === 'function';

        if (hasGetter) {
          result[key] = desc.get.call(this);
        }

        if (skipEmpty && (result[key] === undefined || result[key] === null)) {
          delete result[key];
        }

        return result;
      }, base);
  }

  public async delete() {
    await BaseStorage.current.delete(this.id);
  }

  private assign(content: { [key in keyof T]?: T[key] }, defaults = false) {
    const validated = ['id', 'type', ...getValidatedProperties(this)];
    const filteredContent = Object.keys(content)
      .map(key => key.replace(/^_/, ''))
      .filter(key => validated.indexOf(key) >= 0)
      .reduce((result, key) => ({ ...result, [key]: content[key] }), {});

    const afterDefaults = defaults ? this.toJSON(true) : {};
    Object.assign(this, filteredContent, afterDefaults);
  }
}
