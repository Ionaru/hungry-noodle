import { Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";

import { AudioController } from "./audio/audio.controller";
import { AudioService } from "./audio/audio.service";

@Component({
  selector: "app-root",
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class App {
  // Ensure audio effects are wired app-wide
  readonly _audioController = inject(AudioController);
  readonly #audioService = inject(AudioService);

  constructor() {
    this.#audioService.unlock();
  }
}
