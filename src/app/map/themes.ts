import { TerrainType, type MapTheme } from "./types";

export const THEMES: Record<TerrainType, MapTheme> = {
  [TerrainType.CLASSIC]: {
    background: "#059670",
    backgroundAlt: "#008236",
    border: "#ffffff",
    food: "#ef4444",
    foodGolden: "#f59e0b",
  },
  [TerrainType.GRASSLANDS]: {
    background: "#6eb748",
    backgroundAlt: "#8bc56d",
    border: "#89b2ac",
    food: "#f59e0b",
    foodGolden: "#f59e0b",
  },
  [TerrainType.FOREST]: {
    background: "#065f46",
    backgroundAlt: "#064e3b",
    border: "#628db4",
    food: "#f59e0b",
    foodGolden: "#f59e0b",
  },
  [TerrainType.JUNGLE]: {
    background: "#2e5d2f",
    backgroundAlt: "#446656",
    border: "#8b9999",
    food: "#f59e0b",
    foodGolden: "#f59e0b",
  },
  [TerrainType.DESERT]: {
    background: "#9b6f40",
    backgroundAlt: "#c18747",
    border: "#89a4ab",
    food: "#f59e0b",
    foodGolden: "#f59e0b",
  },
  [TerrainType.ROCKY]: {
    background: "#4a4b4a",
    backgroundAlt: "#6a6d68",
    border: "#131218",
    food: "#f59e0b",
    foodGolden: "#f59e0b",
  },
  [TerrainType.SNOWY]: {
    background: "#f3f4f6",
    backgroundAlt: "#e5e7eb",
    border: "#5279a4",
    food: "#f59e0b",
    foodGolden: "#f59e0b",
  },
  [TerrainType.HELLSCAPE]: {
    background: "#550a11",
    backgroundAlt: "#8a100f",
    border: "#de511b",
    food: "#f59e0b",
    foodGolden: "#f59e0b",
  },
};
