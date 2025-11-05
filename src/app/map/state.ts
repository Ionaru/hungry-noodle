import { Injectable, computed, signal } from "@angular/core";

import { generateMap } from "./generator";
import { type MapConfig, type MapData } from "./types";

@Injectable({ providedIn: "root" })
export class MapState {
  readonly #mapData = signal<MapData>(generateMap());
  readonly mapData = computed(() => this.#mapData());

  init(config: Partial<MapConfig> = {}): void {
    this.#mapData.set(generateMap(config));
  }
}
