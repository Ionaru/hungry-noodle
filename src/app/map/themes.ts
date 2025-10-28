import { TerrainType, type MapTheme } from "./types";

export const THEMES: Record<TerrainType, MapTheme> = {
  [TerrainType.GRASSLANDS]: {
    background: "#059670",
    backgroundAlt: "#008236",
  },
  [TerrainType.FOREST]: {
    background: "#065f46",
    backgroundAlt: "#064e3b",
  },
  [TerrainType.DESERT]: {
    background: "#f59e0b",
    backgroundAlt: "#d97706",
  },
  [TerrainType.MAZE]: {
    background: "#111827",
    backgroundAlt: "#1f2937",
  },
  [TerrainType.SNOWY]: {
    background: "#f3f4f6",
    backgroundAlt: "#e5e7eb",
  },
  [TerrainType.HELLSCAPE]: {
    background: "#111827",
    backgroundAlt: "#1f2937",
  },
};
