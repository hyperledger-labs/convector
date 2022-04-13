/** @module @worldsibu/convector-core-storage */

import { createNamespace, Namespace } from 'cls-hooked';

export const BaseStorageNamespace: Namespace = createNamespace('@worldsibu/convector-core-storage');

export abstract class BaseStorage {
  private static _currentStorage: BaseStorage;
  /**
   * Current storage implementation
   */
  public static get current(): BaseStorage {
    return BaseStorageNamespace.active ? BaseStorageNamespace.get('current') : this._currentStorage;
  }
  public static set current(storage: BaseStorage) {
    if (BaseStorageNamespace.active) {
      BaseStorageNamespace.set('current', storage);
    } else {
      this._currentStorage = storage;
    }
  }

  public async abstract get(id: string, storageOptions?: any): Promise<any>;
  public async abstract set(id: string, content: any, storageOptions?: any);
  public async abstract delete(id: string, storageOptions?: any);
  public async abstract query(...args: any[]): Promise<any[]>;
  public async abstract history(id: string): Promise<any[]>;
}
