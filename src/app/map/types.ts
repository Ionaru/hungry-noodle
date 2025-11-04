export type Color = `#${string}`;

export enum TerrainType {
  CLASSIC = "CLASSIC",
  GRASSLANDS = "GRASSLANDS",
  FOREST = "FOREST",
  JUNGLE = "JUNGLE",
  DESERT = "DESERT",
  ROCKY = "MAZE",
  SNOWY = "SNOWY",
  HELLSCAPE = "HELLSCAPE",
}

export interface MapConfig {
  width: number; // grid units
  height: number; // grid units
  gridSize: number; // pixels per tile
  terrainType: TerrainType;
}

export interface MapTheme {
  background: Color;
  backgroundAlt: Color;
  border: Color;
  food: Color;
  foodGolden: Color;
}

export interface MapData {
  config: MapConfig;
  theme: MapTheme;
}

export interface GridIndex {
  x: number;
  y: number;
}
