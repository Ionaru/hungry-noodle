export enum StoreKey {
  HighScore = "highScore",
  GamesPlayed = "gamesPlayed",
  TotalScore = "totalScore",
  TotalLength = "totalLength",
  PerfectGames = "perfectGames",
  PlayTime = "playTime",
  NoodleCoins = "noodleCoins",
  GoldenNoodles = "goldenNoodles",
}

export interface HungryStore {
  [StoreKey.HighScore]?: number;
  [StoreKey.GamesPlayed]?: number;
  [StoreKey.TotalScore]?: number;
  [StoreKey.TotalLength]?: number;
  [StoreKey.PerfectGames]?: number;
  [StoreKey.PlayTime]?: number;
  [StoreKey.NoodleCoins]?: number;
  [StoreKey.GoldenNoodles]?: number;
}
