import { Injectable, computed, signal } from "@angular/core";

import { MapGenerator } from "./generator";
import { type MapConfig, type MapData } from "./types";

@Injectable({ providedIn: "root" })
export class MapState {
  readonly #mapData = signal<MapData>(MapGenerator.generate());
  readonly mapData = computed(() => this.#mapData());

  init(config: Partial<MapConfig> = {}): void {
    this.#mapData.set(MapGenerator.generate(config));
  }
}
