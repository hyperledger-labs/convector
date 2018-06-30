/** @module convector-core-model */

import * as yup from 'yup';
import { InvalidIdError } from '@worldsibu/convector-core-errors';
import { BaseStorage } from '@worldsibu/convector-core-storage';

import { Validate } from '../src/validate.decorator';
import { getDefaults } from '../src/default.decorator';
import { getValidatedProperties } from '../src/validate.decorator';
import { Required, ensureRequired } from '../src/required.decorator';

/**
 * This class is intended to be inherited by all the models of the application.
 *
 * It provides the underlying communication with the [[BaseStorage]].
 */
export abstract class ConvectorModel<T extends ConvectorModel<any>> {
  /**
   * Fetch one model by its id and instantiate the result
   *
   * @param this The extender type
   * @param id The ID used to fetch the model
   * @param type The type to use for instantiation, if not provided, the extender type is used
   */
  public static async getOne<T extends ConvectorModel<any>>(
    this: new (content: any) => T,
    id: string,
    type?: new (content: any) => T
  ): Promise<T> {
    type = type || this;
    const content = await BaseStorage.current.get(id);
    return new type(content);
  }

  /**
   * Runs a query on the storage layer
   *
   * @param this The extender type
   * @param type The type to use for instantiation, if not provided, the extender type is used
   * @param args The query params, this is passed directly to the current storage being used
   */
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

  /**
   * Return all the models with the given [[ConvectorModel.type]]
   *
   * @param this The extender type
   * @param type The type field to lookup and group the results
   */
  public static async getAll<T extends ConvectorModel<any>>(
    this: new (content: any) => T,
    type?: string
  ): Promise<T[]> {
    type = type || new this('').type;
    return await ConvectorModel.query(this, { selector: { type } }) as T[];
  }

  /**
   * This field is [[Required]] and [[Validate]]d using a string schema
   *
   * Represents the key used to store the model in the blockchain
   */
  @Required()
  @Validate(yup.string())
  public id: string;

  /**
   * This field must be provided by the extender class.
   *
   * It should be [[Required]] and [[ReadOnly]]
   *
   * We normally use a domain name patter for type names, i.e.: `io.worldsibu.example.user`
   */
  public abstract readonly type: string;

  /**
   * The constructor can be called in multiple ways.
   *
   * - As an empty box where you instantiate one and start adding data
   * - As a data fetcher, providing the ID and using [[ConvectorModel.fetch]]
   * - As a formatter, you just pass an object of any shape into the constructor
   *    and it will trim the remaining content and leave what's important
   */
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

  /**
   * Given one model loaded into the instance,
   * update its content with the object passed in the param.
   *
   * Store the result after the update occurs.
   */
  public async update(content: { [key in keyof T]?: T[key] }) {
    this.assign(content);
    await this.save();
  }

  /**
   * Invokes the [[BaseStorage.get]] method to retrieve the model from storage.
   */
  public async fetch() {
    const content = await BaseStorage.current.get(this.id) as ConvectorModel<T>;

    if (content.type !== this.type) {
      throw new Error(`Possible ID collision, element ${this.id} of type ${content.type} is not ${this.type}`);
    }

    this.assign(content as T);
  }

  /**
   * Invokes the [[BaseStorage.set]] method to write into chaincode.
   */
  public async save() {
    this.assign(getDefaults(this), true);
    if (!ensureRequired(this)) {
      throw new Error(`Model ${this.type} is not complete\n${this.toJSON()}`);
    }

    InvalidIdError.test(this.id);
    await BaseStorage.current.set(this.id, this);
  }

  /**
   * Make a copy of this model
   */
  public clone(): T {
    return Object.assign({}, this) as any;
  }

  /**
   * Serealize this model so it can be transferred in the network
   *
   * @param skipEmpty Skip the empty properties
   */
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

  /**
   * Delete a model and persist the changes into the blockchain.
   *
   * Notice that there's no such a concept as **delete** in the blockchain,
   * so what this does is to remove all the reachable references to the model.
   */
  public async delete() {
    await BaseStorage.current.delete(this.id);
  }

  /**
   * Extend the current model definition with some more data
   *
   * @hidden
   *
   * @param defaults Should the [[Default]]s be applied
   */
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
