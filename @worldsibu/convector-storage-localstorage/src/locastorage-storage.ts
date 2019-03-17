/** @module @worldsibu/convector-storage-stub */

import { InvalidIdError, BaseStorage } from '@worldsibu/convector-core';

export class LocalstorageStorage extends BaseStorage {
  constructor(public namespace = 'CONVECTOR_STORAGE') {
    super();
  }

  public clean() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(this.namespace))
      .forEach(k => localStorage.removeItem(k));
  }

  public async query(query: any): Promise<any[]> {
    if (!('selector' in query)) {
      throw new Error('The method `query` in the Localstorage storage must be used with {selector: {key: value}}');
    }

    return Object.keys(localStorage)
      .map(k => JSON.parse(localStorage.getItem(k)))
      .filter(v => Object.keys(query.selector).every(k => v[k] === query.selector[k]));
  }

  public async get(id: string): Promise<any> {
    InvalidIdError.test(id);
    return JSON.parse(localStorage.getItem(`${this.namespace}::${id}`));
  }

  public async set(id: string, content: any) {
    InvalidIdError.test(id);
    localStorage.setItem(`${this.namespace}::${id}`, JSON.stringify(content));
  }

  public async delete(id: string) {
    InvalidIdError.test(id);
    localStorage.removeItem(`${this.namespace}::${id}`);
  }

  public async history(id: string): Promise<any[]> {
    InvalidIdError.test(id);
    throw new Error('The method `history` in the Localstorage storage is not supported');
  }
}
