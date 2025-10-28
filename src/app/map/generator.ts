import { THEMES } from "./themes";
import type { MapConfig, MapData, GridIndex } from "./types";

export const MapGenerator = {
  generate(config: MapConfig): MapData {
    const obstacles: GridIndex[] = [];

    const theme = THEMES[config.terrainType];
    return { config, obstacles, theme };
  },
};
