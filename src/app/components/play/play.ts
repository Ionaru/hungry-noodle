import { Component } from "@angular/core";

import { GameCanvas } from "../game-canvas/game-canvas";

@Component({
  selector: "app-play",
  imports: [GameCanvas],
  template: `<app-game-canvas />`,
})
export class Play {}
