import { Injectable, signal, computed, resource, inject, effect } from "@angular/core";

import { StoreKey } from "./storage/data";
import { Store } from "./store";

export interface UpdatePlayerStats {
  currentScore: number;
  playTime: number;
  currentLength: number;
}

export interface PlayerStats {
  gamesPlayed: number;
  totalScore: number;
  highScore: number;
  totalLength: number;
  perfectGames: number;
  playTime: number; // in seconds
}

export interface UnlockedContent {
  maps: string[];
  snakeTypes: string[];
  cosmetics: string[];
}

@Injectable({
  providedIn: "root",
})
export class Progression {

  readonly #store = inject(Store);

  // Currency signals
  readonly noodleCoins = signal(0);
  readonly goldenNoodles = signal(0);

  // Progression signals
  readonly playerStats = signal<PlayerStats>({
    gamesPlayed: 0,
    totalScore: 0,
    highScore: 0,
    totalLength: 0,
    perfectGames: 0,
    playTime: 0,
  });

  readonly unlockedMaps = signal<string[]>(["classic"]);
  readonly unlockedSnakeTypes = signal<string[]>(["friendly"]);
  readonly unlockedCosmetics = signal<string[]>(["default"]);

  // Computed values
  readonly totalCoins = computed(
    () => this.noodleCoins() + this.goldenNoodles() * 100,
  );

  readonly playerLevel = computed(() => {
    const stats = this.playerStats();
    // Simple level calculation based on games played and high score
    return Math.floor((stats.gamesPlayed + stats.highScore / 100) / 10) + 1;
  });

  readonly unlockedContent = computed<UnlockedContent>(() => ({
    maps: this.unlockedMaps(),
    snakeTypes: this.unlockedSnakeTypes(),
    cosmetics: this.unlockedCosmetics(),
  }));

  // Resource for server sync when online
  readonly leaderboard = resource({
    params: () => ({ playerId: this.getPlayerId() }),
    loader: ({ params }) => this.syncLeaderboard(params.playerId),
  });

  // Currency management
  earnNoodleCoins(amount: number): void {
    this.#store.write(StoreKey.NoodleCoins, this.noodleCoins() + amount);

    // Analytics tracking would go here
    this.trackCoinEarned(amount);
  }

  spendNoodleCoins(amount: number): boolean {
    const current = this.noodleCoins();
    if (current >= amount) {
      this.noodleCoins.set(current - amount);
      this.trackCoinSpent(amount);
      return true;
    }
    return false;
  }

  earnGoldenNoodles(amount: number): void {
    this.goldenNoodles.update((current) => current + amount);
    this.trackPremiumCurrencyEarned(amount);
  }

  spendGoldenNoodles(amount: number): boolean {
    const current = this.goldenNoodles();
    if (current >= amount) {
      this.goldenNoodles.set(current - amount);
      this.trackPremiumCurrencySpent(amount);
      return true;
    }
    return false;
  }

  // Progression management
  updateStats(update: UpdatePlayerStats): void {
    this.playerStats.update((current) => ({
      ...current,
      gamesPlayed: current.gamesPlayed + 1,
      highScore: Math.max(current.highScore, update.currentScore),
      playTime: current.playTime + update.playTime,
      totalLength: current.totalLength + update.currentLength,
      totalScore: current.totalScore + update.currentScore,
    }));

    this.#store.write(StoreKey.HighScore, this.playerStats().highScore);
    this.#store.write(StoreKey.GamesPlayed, this.playerStats().gamesPlayed);
    this.#store.write(StoreKey.TotalScore, this.playerStats().totalScore);
    this.#store.write(StoreKey.TotalLength, this.playerStats().totalLength);
    this.#store.write(StoreKey.PerfectGames, this.playerStats().perfectGames);
    this.#store.write(StoreKey.PlayTime, this.playerStats().playTime);
  }

  unlockMap(mapId: string): void {
    this.unlockedMaps.update((maps) => {
      if (!maps.includes(mapId)) {
        return [...maps, mapId];
      }
      return maps;
    });
  }

  unlockSnakeType(snakeId: string): void {
    this.unlockedSnakeTypes.update((types) => {
      if (!types.includes(snakeId)) {
        return [...types, snakeId];
      }
      return types;
    });
  }

  unlockCosmetic(cosmeticId: string): void {
    this.unlockedCosmetics.update((cosmetics) => {
      if (!cosmetics.includes(cosmeticId)) {
        return [...cosmetics, cosmeticId];
      }
      return cosmetics;
    });
  }

  // Check if content can be unlocked
  canUnlockMap(mapId: string): boolean {
    // TODO: Implement unlock requirements logic
    const level = this.playerLevel();
    const mapRequirements: Record<string, number> = {
      "maze-1": 2,
      "maze-2": 4,
      "speed-challenge": 6,
      "tiny-world": 8,
    };

    return level >= (mapRequirements[mapId] || 1);
  }

  // Private helper methods
  private getPlayerId(): string {
    // TODO: Implement proper player ID generation/retrieval
    return "local-player-" + Date.now().toString();
  }

  private syncLeaderboard(playerId: string): Promise<never[]> {
    // TODO: Implement server sync
    console.log("Syncing leaderboard for player:", playerId);
    return Promise.resolve([]);
  }

  // Analytics methods (placeholders)
  private trackCoinEarned(amount: number): void {
    console.log("Coins earned:", amount);
  }

  private trackCoinSpent(amount: number): void {
    console.log("Coins spent:", amount);
  }

  private trackPremiumCurrencyEarned(amount: number): void {
    console.log("Golden noodles earned:", amount);
  }

  private trackPremiumCurrencySpent(amount: number): void {
    console.log("Golden noodles spent:", amount);
  }

  constructor() {
    effect(() => {
      this.playerStats.update((current) => ({
        ...current,
        gamesPlayed: this.#store.gamesPlayed() ?? 0,
        totalScore: this.#store.totalScore() ?? 0,
        highScore: this.#store.highScore() ?? 0,
        totalLength: this.#store.totalLength() ?? 0,
        perfectGames: this.#store.perfectGames() ?? 0,
        playTime: this.#store.playTime() ?? 0,
      }));
    });

    effect(() => {
      this.noodleCoins.set(this.#store.noodleCoins() ?? 0);
      this.goldenNoodles.set(this.#store.goldenNoodles() ?? 0);
    });
  }
}
