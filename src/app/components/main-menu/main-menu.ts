import { Component, inject, computed } from "@angular/core";
import { Router } from "@angular/router";
import {
  faCartShopping,
  faCircle,
  faGamepad,
  faLeaf,
  faSignalBars,
  faSliders,
  faStar,
} from "@awesome.me/kit-fa99832706/icons/slab/regular";
import {
  FaIconComponent,
  IconDefinition,
} from "@fortawesome/angular-fontawesome";

import packageJson from "../../../../package.json";
import { Progression } from "../../services/progression";
import { Store } from "../../services/store";

interface MenuOption {
  id: string;
  label: string;
  icon: IconDefinition;
  route?: string;
  action?: () => void;
  disabled?: boolean;
}

@Component({
  selector: "app-main-menu",
  template: `
    <div
      class="safe-area-top safe-area-bottom from-primary to-secondary font-gorditas flex h-screen flex-col items-center justify-between bg-linear-to-br/srgb p-6"
    >
      <!-- Game Title Section -->
      <div class="flex flex-1 flex-col items-center justify-center text-center">
        <h1
          class="mb-4 text-4xl font-bold text-black drop-shadow-lg sm:text-6xl"
        >
          Hungry Noodle
        </h1>
        <p class="text-lg text-black opacity-90 sm:text-xl">
          Feed the noodle, grow your score!
        </p>

        <!-- Game Stats Preview - Mobile Optimized -->
        <div
          class="mt-4 rounded-2xl bg-white/20 p-4 text-black backdrop-blur-sm"
        >
          <div class="grid grid-cols-2 gap-6">
            <div class="text-center">
              <div class="text-2xl font-bold">{{ highScore() }}</div>
              <div class="text-sm opacity-75">High Score</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ totalScore() }}</div>
              <div class="text-sm opacity-75">Total Score</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Menu Options - Mobile Optimized -->
      <div class="w-full max-w-sm space-y-3">
        @for (option of menuOptions(); track option.id) {
          <button
            (click)="handleMenuClick(option)"
            [disabled]="option.disabled"
            class="flex w-full transform items-center justify-center gap-4 rounded-2xl bg-white px-4 py-3 text-lg font-semibold text-gray-800 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-gray-50 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span class="text-3xl">
              <fa-icon [icon]="option.icon"></fa-icon>
            </span>
            <span class="flex-1 text-left">
              {{ option.label }}
              @if (option.id === "play" && hasSavedGame()) {
                <span class="block text-sm text-gray-600">
                  Score: {{ savedGameScore() }}, Length: {{ savedGameLength() }}
                </span>
              }
            </span>
            @if (option.disabled) {
              <span class="text-sm text-gray-500">Soon</span>
            }
          </button>
        }
      </div>

      <!-- Version Info -->
      <div class="mt-4 text-sm text-black/60">v{{ version }}</div>
    </div>
  `,
  imports: [FaIconComponent],
})
export class MainMenu {
  private readonly router = inject(Router);
  private readonly progression = inject(Progression);
  readonly #store = inject(Store);

  // Game state signals
  readonly highScore = computed(() => this.progression.playerStats().highScore);
  readonly totalScore = computed(
    () => this.progression.playerStats().totalScore,
  );
  readonly version = packageJson.version;

  // Computed for saved game info display
  readonly savedGameInfo = computed(() => {
    const savedGame = this.#store.savedGame();
    if (!savedGame) return null;
    return `Score: ${savedGame.score.toString()}, Length: ${savedGame.snake.length.toString()}`;
  });

  // Public computed values for saved game data
  readonly hasSavedGame = computed(() => Boolean(this.#store.savedGame()));
  readonly savedGameScore = computed(() => this.#store.savedGame()?.score ?? 0);
  readonly savedGameLength = computed(
    () => this.#store.savedGame()?.snake.length ?? 0,
  );

  // Menu configuration - computed to show Continue when saved game exists
  menuOptions = computed<MenuOption[]>(() => {
    const hasSavedGame = this.hasSavedGame();
    return [
      {
        id: "play",
        label: hasSavedGame ? "Continue" : "Quick Play",
        icon: faGamepad,
        route: "/play",
      },
      {
        id: "progression",
        label: "Journey",
        icon: faSignalBars,
        route: "/progression",
        disabled: true,
      },
      {
        id: "challenges",
        label: "Daily Challenges",
        icon: faStar,
        route: "/challenges",
        disabled: true,
      },
      {
        id: "shop",
        label: "Shop",
        icon: faCartShopping,
        route: "/shop",
        disabled: true,
      },
      {
        id: "farm",
        label: "Noodle Farm",
        icon: faLeaf,
        route: "/farm",
        disabled: true, // Will be enabled in Phase 3
      },
      {
        id: "settings",
        label: "Settings",
        icon: faSliders,
        route: "/settings",
        disabled: true,
      },
    ];
  });

  handleMenuClick(option: MenuOption): void {
    if (option.disabled) return;

    if (option.route) {
      void this.router.navigate([option.route]);
    } else if (option.action) {
      option.action();
    }
  }

  protected readonly faCoins = faCircle;
}
