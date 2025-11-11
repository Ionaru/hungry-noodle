import { Injectable, effect, inject, signal } from "@angular/core";

import { MapState } from "../map/state";
import { GameState } from "../services/game-state";

import { AudioService } from "./audio.service";
import { MusicService } from "./music.service";
import { SfxService } from "./sfx.service";

@Injectable({ providedIn: "root" })
export class AudioController {
  readonly #game = inject(GameState);
  readonly #map = inject(MapState);
  readonly #sfx = inject(SfxService);
  readonly #music = inject(MusicService);
  readonly #audio = inject(AudioService);

  readonly #lastDir = signal<ReturnType<GameState["direction"]>>(null);

  constructor() {
    // Direction changes → turn SFX
    effect(() => {
      const direction = this.#game.direction();
      const previous = this.#lastDir();
      if (direction && direction !== previous && this.#audio.unlocked())
        this.#sfx.turn(direction);
      this.#lastDir.set(direction);
    });

    // Food eaten → pickup SFX
    effect(() => {
      const eaten = this.#game.foodEatenEvent();
      if (eaten && this.#audio.unlocked()) {
        this.#sfx.pickup(eaten.type);
      }
    });

    // Game status → music and game over SFX
    effect(() => {
      const status = this.#game.gameStatus();
      if (!this.#audio.unlocked()) return;
      switch (status) {
        case "playing": {
          const terrain = this.#map.mapData().config.terrainType;
          this.#music.playTheme(terrain);

          break;
        }
        case "paused": {
          this.#music.pause();

          break;
        }
        case "gameOver": {
          this.#music.pause();
          this.#sfx.gameOver();

          break;
        }
        // No default
      }
    });

    // Theme changes while playing → crossfade to new theme music
    effect(() => {
      const theme = this.#map.mapData().config.terrainType;
      const status = this.#game.gameStatus();
      if (status === "playing" && this.#audio.unlocked()) {
        this.#music.playTheme(theme);
      }
    });
  }
}
