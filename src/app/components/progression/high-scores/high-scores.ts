import { Component, computed, inject } from "@angular/core";
import { Router } from "@angular/router";
import { faAngleLeft } from "@awesome.me/kit-fa99832706/icons/slab/regular";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";

import { AudioService } from "../../../audio/audio.service";
import { SfxType } from "../../../audio/sfx";
import { Progression } from "../../../services/progression";
import { FluidContainer } from "../../containers/fluid-container";

import { StatCard } from "./stat-card";

@Component({
  selector: "app-high-scores",
  imports: [FaIconComponent, FluidContainer, StatCard],
  template: `
    <app-fluid-container
      class="font-gorditas from-primary to-secondary bg-linear-to-br/srgb"
    >
      <div class="flex h-full flex-col p-6">
        <div class="mb-6 flex items-center gap-3">
          <button
            (click)="goBack()"
            aria-label="Back to menu"
            class="flex h-10 w-10 items-center justify-center rounded-full bg-white/30 text-xl font-bold text-black backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-white/50 active:scale-95"
          >
            <fa-icon [icon]="faAngleLeft" />
          </button>
          <h1 class="text-3xl font-bold text-black drop-shadow-lg sm:text-4xl">
            High Scores
          </h1>
        </div>

        @let s = stats();

        @if (s.gamesPlayed === 0) {
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
            <app-stat-card
              [value]="s.longestSnake"
              label="Longest Snake"
              [highlight]="true"
            />
            <app-stat-card [value]="s.highScore" label="Best Score" />
            <app-stat-card [value]="s.gamesPlayed" label="Games Played" />
            <app-stat-card [value]="playTimeLabel()" label="Play Time" />
            <app-stat-card [value]="s.totalLength" label="Total Length" />
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
  readonly playTimeLabel = computed(() =>
    formatPlayTime(this.stats().playTime),
  );

  goBack(): void {
    this.#audio.playSfx(SfxType.UiClick);
    void this.#router.navigate(["/menu"]);
  }
}

function formatPlayTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  if (hours > 0) return `${hours.toString()}h ${minutes.toString()}m`;
  const seconds = s % 60;
  if (minutes > 0) return `${minutes.toString()}m ${seconds.toString()}s`;
  return `${seconds.toString()}s`;
}
