import { HungryStore, StoreKey } from "./data";

export interface IStore {
  /**
   * Inserts a key-value pair into the store.
   *
   * @param key
   * @param value
   * @returns
   */
  set(key: string, value: unknown): Promise<void>;
  /**
   * Returns the value for the given `key` or `undefined` if the key does not exist.
   *
   * @param key
   * @returns
   */
  get<T>(key: string): Promise<T | undefined>;
  /**
   * Returns `true` if the given `key` exists in the store.
   *
   * @param key
   * @returns
   */
  has(key: string): Promise<boolean>;
  /**
   * Removes a key-value pair from the store.
   *
   * @param key
   * @returns
   */
  delete(key: string): Promise<boolean>;
  /**
   * Clears the store, removing all key-value pairs.
   *
   * Note: To clear the storage and reset it to its `default` value, use {@linkcode reset} instead.
   * @returns
   */
  clear(): Promise<void>;
  /**
   * Resets the store to its `default` value.
   *
   * If no default value has been set, this method behaves identical to {@linkcode clear}.
   * @returns
   */
  reset(): Promise<void>;
  /**
   * Returns a list of all keys in the store.
   *
   * @returns
   */
  keys(): Promise<string[]>;
  /**
   * Returns a list of all values in the store.
   *
   * @returns
   */
  values<T>(): Promise<T[]>;
  /**
   * Returns a list of all entries in the store.
   *
   * @returns
   */
  entries<T>(): Promise<[key: string, value: T][]>;
  /**
   * Returns the number of key-value pairs in the store.
   *
   * @returns
   */
  length(): Promise<number>;
  /**
   * Attempts to load the on-disk state at the store's `path` into memory.
   *
   * This method is useful if the on-disk state was edited by the user and you want to synchronize the changes.
   *
   * Note: This method does not emit change events.
   * @returns
   */
  reload(): Promise<void>;
}

export abstract class PersistantStorage implements IStore {
  abstract init(): Promise<void>;
  abstract set(key: StoreKey, value: HungryStore[StoreKey]): Promise<void>;
  abstract get<T>(key: StoreKey): Promise<T | undefined>;
  abstract has(key: StoreKey): Promise<boolean>;
  abstract delete(key: StoreKey): Promise<boolean>;
  abstract clear(): Promise<void>;
  abstract reset(): Promise<void>;
  abstract keys(): Promise<string[]>;
  abstract values<T>(): Promise<T[]>;
  abstract entries<T>(): Promise<[key: string, value: T][]>;
  abstract length(): Promise<number>;
  abstract reload(): Promise<void>;
}
