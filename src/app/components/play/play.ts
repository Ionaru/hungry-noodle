import { Component } from "@angular/core";

import { GameCanvas } from "../game-canvas/game-canvas";

@Component({
  selector: "app-play",
  imports: [GameCanvas],
  template: `<app-game-canvas class="h-screen w-screen" />`,
})
export class Play {}
