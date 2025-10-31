import { THEMES } from "./themes";
import type { MapConfig, MapData } from "./types";

export const MapGenerator = {
  generate(config: MapConfig): MapData {
    const theme = THEMES[config.terrainType];
    return { config, theme };
  },
};
