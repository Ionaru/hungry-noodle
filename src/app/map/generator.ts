import { THEMES } from "./themes";
import { TerrainType, type MapConfig, type MapData } from "./types";

export const generateMap = (configInput: Partial<MapConfig> = {}): MapData => {
  const config = {
    width: 80,
    height: 120,
    gridSize: 16,
    terrainType: TerrainType.CLASSIC,
    ...configInput,
  };
  const theme = THEMES[config.terrainType];
  return { config, theme };
};
