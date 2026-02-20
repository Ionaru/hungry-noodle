import { Component, inject, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";

import { AudioService } from "./audio/audio.service";

@Component({
  selector: "app-root",
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class App implements OnInit {
  readonly #audio = inject(AudioService);

  ngOnInit(): void {
    // Initialize audio system
    // In a browser, this might remain suspended until user interaction
    // In Tauri/WebView, it might work immediately
    void this.#audio.init();

    // Fallback: Unlock audio on first interaction
    const unlockAudio = async () => {
      await this.#audio.init();
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("touchstart", unlockAudio);
    };

    document.addEventListener("click", unlockAudio);
    document.addEventListener("touchstart", unlockAudio);
  }
}
