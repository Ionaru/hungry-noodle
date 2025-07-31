import { Component, signal, inject, OnInit, computed } from "@angular/core";
import { Router } from "@angular/router";

import { Progression } from "../../services/progression";

interface MenuOption {
  id: string;
  label: string;
  icon: string;
  route?: string;
  action?: () => void;
  disabled?: boolean;
}

@Component({
  selector: "app-main-menu",
  template: `
    <div
      class="safe-area-top safe-area-bottom flex h-screen flex-col items-center justify-between bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 p-6"
    >
      <!-- Game Title Section -->
      <div class="flex flex-1 flex-col items-center justify-center text-center">
        <h1
          class="mb-4 text-5xl font-bold text-white drop-shadow-lg sm:text-6xl"
        >
          🍜 Hungry Noodle
        </h1>
        <p class="text-lg text-white opacity-90 sm:text-xl">
          Feed the noodle, grow your score!
        </p>

        <!-- Game Stats Preview - Mobile Optimized -->
        <div
          class="mt-8 rounded-2xl bg-white/20 p-4 text-white backdrop-blur-sm"
        >
          <div class="grid grid-cols-2 gap-6">
            <div class="text-center">
              <div class="text-2xl font-bold">{{ highScore() }}</div>
              <div class="text-sm opacity-75">High Score</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ noodleCoins() }}</div>
              <div class="text-sm opacity-75">🪙 Coins</div>
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
            class="flex w-full transform items-center justify-center gap-4 rounded-2xl bg-white px-6 py-5 text-lg font-semibold text-gray-800 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-gray-50 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span class="text-3xl">{{ option.icon }}</span>
            <span class="flex-1 text-left">{{ option.label }}</span>
            @if (option.disabled) {
              <span class="text-sm text-gray-500">Soon</span>
            }
          </button>
        }
      </div>

      <!-- Version Info -->
      <div class="mt-4 text-sm text-white/60">v{{ version }}</div>
    </div>
  `,
})
export class MainMenu implements OnInit {
  private readonly router = inject(Router);
  private readonly progression = inject(Progression);

  // Game state signals
  readonly highScore = computed(() => this.progression.playerStats().highScore);
  readonly noodleCoins = this.progression.noodleCoins;
  readonly version = "0.1.0";

  // Menu configuration
  menuOptions = signal<MenuOption[]>([
    {
      id: "play",
      label: "Play",
      icon: "🎮",
      route: "/play",
    },
    {
      id: "progression",
      label: "Progress",
      icon: "🏆",
      route: "/progression",
    },
    {
      id: "shop",
      label: "Shop",
      icon: "🛒",
      route: "/shop",
    },
    {
      id: "challenges",
      label: "Daily Challenges",
      icon: "⭐",
      route: "/challenges",
    },
    {
      id: "farm",
      label: "Noodle Farm",
      icon: "🌱",
      route: "/farm",
      disabled: true, // Will be enabled in Phase 3
    },
    {
      id: "settings",
      label: "Settings",
      icon: "⚙️",
      route: "/settings",
    },
  ]);

  handleMenuClick(option: MenuOption): void {
    if (option.disabled) return;

    if (option.route) {
      void this.router.navigate([option.route]);
    } else if (option.action) {
      option.action();
    }
  }

  ngOnInit(): void {
    this.progression.loadPlayerData();
  }
}
