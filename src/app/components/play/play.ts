import { Component, inject, effect } from "@angular/core";

import { GameState } from "../../services/game-state";
import { Store } from "../../services/store";
import { GameCanvas } from "../game-canvas/game-canvas";

@Component({
  selector: "app-play",
  imports: [GameCanvas],
  template: `<app-game-canvas />`,
})
export class Play {
  private readonly gameState = inject(GameState);
  private readonly store = inject(Store);

  constructor() {
    // Load saved game on component init if present and game isn't already active
    effect(() => {
      const savedGame = this.store.savedGame();

      // Only load if we have a saved game and the current game is not active
      if (savedGame && this.gameState.snake.length() === 0) {
        try {
          this.gameState.loadFromSavedGame(savedGame);
          // Set to paused state so player must press Resume
          this.gameState.gameStatus.set("paused");
        } catch (error) {
          console.error("Failed to load saved game:", error);
          // Clear corrupted save
          this.store.clearSavedGame();
        }
      }
    });
  }
}
