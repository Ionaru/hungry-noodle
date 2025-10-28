export enum TerrainType {
  GRASSLANDS = "GRASSLANDS",
  FOREST = "FOREST",
  DESERT = "DESERT",
  MAZE = "MAZE",
  SNOWY = "SNOWY",
  HELLSCAPE = "HELLSCAPE",
}

export enum ObstacleType {
  WALL = "WALL",
  ROCK = "ROCK",
  BUSH = "BUSH",
}

export interface MapConfig {
  width: number; // grid units
  height: number; // grid units
  gridSize: number; // pixels per tile
  terrainType: TerrainType;
}

export interface MapTheme {
  background: string;
  backgroundAlt: string;
}

export interface MapData {
  config: MapConfig;
  // List of obstacle positions for easier serialization and manipulation
  obstacles: GridIndex[];
  theme: MapTheme;
}

export interface GridIndex {
  x: number;
  y: number;
}
