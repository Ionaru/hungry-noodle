import { load, Store } from "@tauri-apps/plugin-store";

import { PersistantStorage } from "./persistant-storage";

export class TauriPersistantStorage extends PersistantStorage {
  #store!: Store;

  async init(): Promise<void> {
    this.#store = await load("store.json");
  }

  async set(key: string, value: unknown): Promise<void> {
    await this.#store.set(key, value);
  }

  async get<T>(key: string): Promise<T | undefined> {
    return await this.#store.get(key);
  }

  async has(key: string): Promise<boolean> {
    return await this.#store.has(key);
  }

  async delete(key: string): Promise<boolean> {
    return await this.#store.delete(key);
  }

  async clear(): Promise<void> {
    await this.#store.clear();
  }

  async reset(): Promise<void> {
    await this.#store.reset();
  }

  async keys(): Promise<string[]> {
    return await this.#store.keys();
  }

  async values<T>(): Promise<T[]> {
    return await this.#store.values();
  }

  async entries<T>(): Promise<[key: string, value: T][]> {
    return await this.#store.entries();
  }

  async length(): Promise<number> {
    return await this.#store.length();
  }

  async reload(): Promise<void> {
    await this.#store.reload();
  }
}
