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
  MusicVolume = "musicVolume",
  SfxVolume = "sfxVolume",
  Mute = "mute",
  MasterVolume = "masterVolume",
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
  [StoreKey.MusicVolume]?: number; // 0..1
  [StoreKey.SfxVolume]?: number; // 0..1
  [StoreKey.Mute]?: boolean;
  [StoreKey.MasterVolume]?: number; // 0..1
}
