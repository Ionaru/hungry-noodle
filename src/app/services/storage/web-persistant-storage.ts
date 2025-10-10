import { PersistantStorage } from "./persistant-storage";

export class WebPersistantStorage extends PersistantStorage {
  init(): Promise<void> {
    return Promise.resolve();
  }

  set(key: string, value: unknown): Promise<void> {
    localStorage.setItem(key, JSON.stringify({ value }));
    return Promise.resolve();
  }

  get<T>(key: string): Promise<T | undefined> {
    const value = localStorage.getItem(key);
    return Promise.resolve(
      value ? (JSON.parse(value) as { value: T }).value : undefined,
    );
  }

  has(key: string): Promise<boolean> {
    return Promise.resolve(localStorage.getItem(key) !== null);
  }

  delete(key: string): Promise<boolean> {
    localStorage.removeItem(key);
    return Promise.resolve(true);
  }

  clear(): Promise<void> {
    localStorage.clear();
    return Promise.resolve();
  }

  reset(): Promise<void> {
    localStorage.clear();
    return Promise.resolve();
  }

  keys(): Promise<string[]> {
    return Promise.resolve(Object.keys(localStorage));
  }

  values<T>(): Promise<T[]> {
    return Promise.resolve(Object.values(localStorage) as T[]);
  }

  entries<T>(): Promise<[key: string, value: T][]> {
    const entries = Object.entries<string>(localStorage);
    return Promise.resolve(
      entries.map(([key, value]) => [
        key,
        (JSON.parse(value) as { value: T }).value,
      ]),
    );
  }

  length(): Promise<number> {
    return Promise.resolve(Object.keys(localStorage).length);
  }

  reload(): Promise<void> {
    return Promise.resolve();
  }
}
