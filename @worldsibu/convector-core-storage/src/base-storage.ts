/** @module @worldsibu/convector-core-storage */

const g: any = global;

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

  public async abstract get(id: string): Promise<any>;
  public async abstract set(id: string, content: any);
  public async abstract delete(id: string);
  public async abstract query(...args: any[]): Promise<any[]>;
  public async abstract history(id: string): Promise<any[]>;
}
