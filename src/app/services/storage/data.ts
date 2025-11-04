import { Food } from "../../food/types";
import { TerrainType } from "../../map/types";
import { SnakeSegment } from "../../snake/types";

export enum StoreKey {
  HighScore = "highScore",
  GamesPlayed = "gamesPlayed",
  TotalScore = "totalScore",
  TotalLength = "totalLength",
  PerfectGames = "perfectGames",
  PlayTime = "playTime",
  NoodleCoins = "noodleCoins",
  GoldenNoodles = "goldenNoodles",
  SavedGame = "savedGame",
}

export interface SavedGame {
  version: number;
  score: number;
  snake: SnakeSegment[];
  food: Food[];
  direction: "up" | "down" | "left" | "right" | null;
  gameTime: number;
  gridSize: number;
  worldWidth: number;
  worldHeight: number;
  camera: { x: number; y: number };
  mapTerrainType?: TerrainType;
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
  [StoreKey.SavedGame]?: SavedGame | null;
}
