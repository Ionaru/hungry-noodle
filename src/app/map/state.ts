import { Injectable, computed, signal } from "@angular/core";

import { MapGenerator } from "./generator";
import { TerrainType, type MapConfig, type MapData } from "./types";

@Injectable({ providedIn: "root" })
export class MapState {
  readonly #mapData = signal<MapData | null>(null);

  readonly mapData = computed(() => {
    const data = this.#mapData();
    if (!data) {
      // Provide a minimal default to avoid null checks during boot
      return MapGenerator.generate({
        width: 80,
        height: 120,
        gridSize: 16,
        terrainType: TerrainType.GRASSLANDS,
      });
    }
    return data;
  });

  init(config: MapConfig): void {
    this.#mapData.set(MapGenerator.generate(config));
  }
}
