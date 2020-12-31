/** @module @worldsibu/convector-core-storage */

import * as g from 'window-or-global';

export abstract class BaseStorage {
  /**
   * Current storage implementation
   */
  public static get current(): BaseStorage {
    return g.ConvectorBaseStorageCurrent;
  }
  public static set current(storage: BaseStorage) {
    g.ConvectorBaseStorageCurrent = storage;
  }

  public abstract get(id: string, storageOptions?: any): Promise<any>;
  public abstract set(id: string, content: any, storageOptions?: any);
  public abstract delete(id: string, storageOptions?: any);
  public abstract query(...args: any[]): Promise<any[]>;
  public abstract history(id: string): Promise<any[]>;
}
