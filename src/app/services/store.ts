import { computed, inject, Injectable, resource } from "@angular/core";

import { PERSISTANT_STORAGE } from "../app.tokens";

import { HungryStore, StoreKey } from "./storage/data";

@Injectable({
  providedIn: "root",
})
export class Store {

  readonly #persistantStorage = inject(PERSISTANT_STORAGE);

  readonly #store = resource<HungryStore, null>({
    loader: async () => {
      await this.#persistantStorage.init();
      return Object.fromEntries(await this.#persistantStorage.entries()) as unknown as HungryStore;
    },
  });

  readonly highScore = computed(() => this.#store.value()?.[StoreKey.HighScore]);
  readonly gamesPlayed = computed(() => this.#store.value()?.[StoreKey.GamesPlayed]);
  readonly totalScore = computed(() => this.#store.value()?.[StoreKey.TotalScore]);
  readonly totalLength = computed(() => this.#store.value()?.[StoreKey.TotalLength]);
  readonly perfectGames = computed(() => this.#store.value()?.[StoreKey.PerfectGames]);
  readonly playTime = computed(() => this.#store.value()?.[StoreKey.PlayTime]);
  readonly noodleCoins = computed(() => this.#store.value()?.[StoreKey.NoodleCoins]);
  readonly goldenNoodles = computed(() => this.#store.value()?.[StoreKey.GoldenNoodles]);

  write(key: StoreKey, value: HungryStore[StoreKey]): void {
    this.#store.update((state) => ({ ...state, [key]: value }));
    void this.#persistantStorage.set(key, value);
  }
}
