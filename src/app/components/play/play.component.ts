import { Component } from "@angular/core";
import { GameCanvasComponent } from "../game-canvas/game-canvas.component";

@Component({
  selector: "app-play",
  standalone: true,
  imports: [GameCanvasComponent],
  template: ` <app-game-canvas></app-game-canvas> `,
})
export class PlayComponent {}
