import { Component, computed, inject } from "@angular/core";
import { Router } from "@angular/router";
import { faAngleLeft } from "@awesome.me/kit-fa99832706/icons/slab/regular";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";

import { AudioService } from "../../../audio/audio.service";
import { SfxType } from "../../../audio/sfx";
import { Progression } from "../../../services/progression";
import { FluidContainer } from "../../containers/fluid-container";

@Component({
  selector: "app-high-scores",
  imports: [FaIconComponent, FluidContainer],
  template: `
    <app-fluid-container
      class="font-gorditas from-primary to-secondary bg-linear-to-br/srgb"
    >
      <div class="flex h-full flex-col p-6">
        <div class="mb-6 flex items-center gap-3">
          <button
            (click)="goBack()"
            aria-label="Back to menu"
            class="flex h-10 w-10 transform items-center justify-center rounded-full bg-white/30 text-xl font-bold text-black backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-white/50 active:scale-95"
          >
            <fa-icon [icon]="faAngleLeft" />
          </button>
          <h1 class="text-3xl font-bold text-black drop-shadow-lg sm:text-4xl">
            High Scores
          </h1>
        </div>

        @if (isEmpty()) {
          <div
            class="flex flex-1 flex-col items-center justify-center text-center"
          >
            <div
              class="rounded-2xl bg-white/20 p-8 text-black backdrop-blur-sm"
            >
              <h2 class="mb-2 text-2xl font-semibold">No stats yet</h2>
              <p class="opacity-80">
                Play your first game to start your journey!
              </p>
            </div>
          </div>
        } @else {
          <div class="grid grid-cols-2 gap-3 text-black sm:gap-4">
            <div
              class="col-span-2 flex flex-col items-center rounded-2xl bg-white/20 p-4 text-center backdrop-blur-sm"
            >
              <div class="text-3xl font-bold">{{ stats().longestSnake }}</div>
              <div class="mt-1 text-sm opacity-75">Longest Snake</div>
            </div>
            <div
              class="flex flex-col items-center rounded-2xl bg-white/20 p-4 text-center backdrop-blur-sm"
            >
              <div class="text-3xl font-bold">{{ stats().highScore }}</div>
              <div class="mt-1 text-sm opacity-75">Best Score</div>
            </div>
            <div
              class="flex flex-col items-center rounded-2xl bg-white/20 p-4 text-center backdrop-blur-sm"
            >
              <div class="text-3xl font-bold">{{ stats().gamesPlayed }}</div>
              <div class="mt-1 text-sm opacity-75">Games Played</div>
            </div>
            <div
              class="flex flex-col items-center rounded-2xl bg-white/20 p-4 text-center backdrop-blur-sm"
            >
              <div class="text-3xl font-bold">{{ playTimeLabel() }}</div>
              <div class="mt-1 text-sm opacity-75">Play Time</div>
            </div>
            <div
              class="flex flex-col items-center rounded-2xl bg-white/20 p-4 text-center backdrop-blur-sm"
            >
              <div class="text-3xl font-bold">{{ stats().totalLength }}</div>
              <div class="mt-1 text-sm opacity-75">Total Length</div>
            </div>
          </div>
        }
      </div>
    </app-fluid-container>
  `,
})
export class HighScores {
  readonly #router = inject(Router);
  readonly #progression = inject(Progression);
  readonly #audio = inject(AudioService);

  readonly faAngleLeft = faAngleLeft;

  readonly stats = this.#progression.playerStats;
  readonly isEmpty = computed(() => this.stats().gamesPlayed === 0);
  readonly playTimeLabel = computed(() =>
    formatPlayTime(this.stats().playTime),
  );

  goBack(): void {
    this.#audio.playSfx(SfxType.UiClick);
    void this.#router.navigate(["/menu"]);
  }
}

function formatPlayTime(totalSeconds: number): string {
  if (totalSeconds <= 0) return "0m";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  if (hours > 0) return `${hours.toString()}h ${minutes.toString()}m`;
  if (minutes > 0) return `${minutes.toString()}m ${seconds.toString()}s`;
  return `${seconds.toString()}s`;
}
