import { Component, computed, inject, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import {
  faGamepad,
  faSignalBars,
} from "@awesome.me/kit-fa99832706/icons/slab/regular";
import {
  FaIconComponent,
  IconDefinition,
} from "@fortawesome/angular-fontawesome";

import { AudioService } from "../../audio/audio.service";
import { SfxType } from "../../audio/sfx";
import { Store } from "../../services/store";
import { FluidContainer } from "../containers/fluid-container";

interface GameMode {
  id: string;
  label: string;
  description: string;
  icon: IconDefinition;
  backgroundImage: string;
  route?: string;
  disabled?: boolean;
}

@Component({
  selector: "app-mode-select",
  template: `
    <app-fluid-container
      class="font-gorditas from-primary to-secondary bg-linear-to-br/srgb"
    >
      <div class="flex h-full flex-col gap-4 p-4">
        <!-- Header -->
        <div class="flex items-center gap-3">
          <button
            (click)="goBack()"
            aria-label="Back to menu"
            class="flex h-10 w-10 items-center justify-center rounded-full bg-white/30 text-2xl leading-none text-black shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-white/50 active:scale-95"
          >
            <span aria-hidden="true">&lsaquo;</span>
          </button>
          <h1 class="text-2xl font-bold text-black drop-shadow-sm sm:text-3xl">
            Choose Mode
          </h1>
        </div>

        <!-- Continue Banner (only when a saved game exists) -->
        @if (hasSavedGame()) {
          <button
            (click)="continueGame()"
            class="flex w-full items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 text-left text-gray-800 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-[1.01] hover:bg-white active:scale-[0.99]"
          >
            <span class="text-2xl">
              <fa-icon [icon]="faGamepad"></fa-icon>
            </span>
            <span class="flex-1">
              <span class="block text-base font-semibold">Continue</span>
              <span class="block text-sm text-gray-600">
                Score: {{ savedGameScore() }}, Length:
                {{ savedGameLength() }}
              </span>
            </span>
          </button>
        }

        <!-- Mode Tiles -->
        <div class="flex flex-1 flex-col gap-4">
          @for (mode of modes(); track mode.id) {
            <button
              (click)="selectMode(mode)"
              [disabled]="mode.disabled"
              [style.background-image]="'url(' + mode.backgroundImage + ')'"
              class="group relative flex w-full flex-1 items-end overflow-hidden rounded-2xl bg-gray-700 bg-cover bg-center shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:hover:scale-100"
              [class.opacity-70]="mode.disabled"
            >
              <!-- Dark gradient scrim for legibility -->
              <div
                class="absolute inset-0 bg-linear-to-t/srgb from-black/80 via-black/30 to-black/10"
              ></div>

              <!-- Locked pill -->
              @if (mode.disabled) {
                <span
                  class="absolute top-3 right-3 z-10 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase"
                >
                  Coming Soon
                </span>
              }

              <!-- Tile content -->
              <div
                class="relative z-10 flex w-full flex-col gap-1 p-5 text-left text-white"
              >
                <span class="flex items-center gap-3">
                  <fa-icon
                    [icon]="mode.icon"
                    class="text-3xl drop-shadow-lg"
                  ></fa-icon>
                  <span class="text-3xl font-bold drop-shadow-lg sm:text-4xl">
                    {{ mode.label }}
                  </span>
                </span>
                <span class="text-sm opacity-90 drop-shadow sm:text-base">
                  {{ mode.description }}
                </span>
              </div>
            </button>
          }
        </div>
      </div>
    </app-fluid-container>
  `,
  imports: [FaIconComponent, FluidContainer],
})
export class ModeSelect implements OnInit {
  readonly #router = inject(Router);
  readonly #store = inject(Store);
  readonly #audio = inject(AudioService);

  protected readonly faGamepad = faGamepad;

  readonly hasSavedGame = computed(() => Boolean(this.#store.savedGame()));
  readonly savedGameScore = computed(() => this.#store.savedGame()?.score ?? 0);
  readonly savedGameLength = computed(
    () => this.#store.savedGame()?.snake.length ?? 0,
  );

  readonly modes = computed<GameMode[]>(() => [
    {
      id: "endless",
      label: "Endless",
      description: "Survive as long as you can and chase a new high score.",
      icon: faGamepad,
      backgroundImage: "/mode-endless.jpg",
      route: "/play/endless",
    },
    {
      id: "journey",
      label: "Journey",
      description: "Adventure through curated levels.",
      icon: faSignalBars,
      backgroundImage: "/mode-journey.jpg",
      disabled: true,
    },
  ]);

  ngOnInit(): void {
    this.#audio.playMusic("menu");
  }

  selectMode(mode: GameMode): void {
    if (mode.disabled || !mode.route) return;
    this.#audio.playSfx(SfxType.UiClick);
    void this.#router.navigate([mode.route]);
  }

  continueGame(): void {
    this.#audio.playSfx(SfxType.UiClick);
    void this.#router.navigate(["/play/endless"]);
  }

  goBack(): void {
    this.#audio.playSfx(SfxType.UiClick);
    void this.#router.navigate(["/menu"]);
  }
}
