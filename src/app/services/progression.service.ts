import { Injectable, signal, computed, resource } from "@angular/core";

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
export class ProgressionService {
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
    this.noodleCoins.update((current) => current + amount);

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
  updateStats(gameStats: Partial<PlayerStats>): void {
    this.playerStats.update((current) => ({
      ...current,
      ...gameStats,
      gamesPlayed: current.gamesPlayed + 1,
      totalScore: current.totalScore + (gameStats.totalScore ?? 0),
      highScore: Math.max(current.highScore, gameStats.highScore ?? 0),
      totalLength: current.totalLength + (gameStats.totalLength ?? 0),
      playTime: current.playTime + (gameStats.playTime ?? 0),
    }));
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

  private async syncLeaderboard(playerId: string): Promise<never[]> {
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

  // Initialization
  loadPlayerData(): void {
    // TODO: Load from IndexedDB/localStorage
    this.noodleCoins.set(47); // Demo data
    this.goldenNoodles.set(5); // Demo data

    this.playerStats.set({
      gamesPlayed: 23,
      totalScore: 15420,
      highScore: 1250,
      totalLength: 847,
      perfectGames: 3,
      playTime: 3600, // 1 hour
    });
  }
}
