import {
  Component,
  ElementRef,
  viewChild,
  inject,
  OnDestroy,
  AfterViewInit,
  signal,
  effect,
  computed,
} from "@angular/core";
import { Router } from "@angular/router";
import {
  faPause,
  faBolt,
  faStar,
} from "@awesome.me/kit-fa99832706/icons/slab/regular";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { Gesture, GestureController } from "@ionic/angular/standalone";

import { handleKeyboard } from "../../controls/keyboard";
import { handleSwipe } from "../../controls/swipe";
import { drawBackgroundPattern } from "../../drawing/background";
import { drawFoodDirectionIndicator } from "../../drawing/direction-indicator";
import { drawEdgeShadows } from "../../drawing/edge-shadows";
import { drawFood } from "../../drawing/food";
import { drawGrid } from "../../drawing/grid";
import { drawSnake } from "../../drawing/snake";
import { drawTurboOverlay } from "../../drawing/turbo-overlay";
import { drawWorldDecorations } from "../../drawing/world-decorations";
import { GameState, Direction } from "../../services/game-state";
import { Progression } from "../../services/progression";
import { Store } from "../../services/store";
import { SafeContainer } from "../containers/safe-container";

@Component({
  selector: "app-game-canvas",
  templateUrl: "./game-canvas.html",
  imports: [SafeContainer, FaIconComponent],
})
export class GameCanvas implements AfterViewInit, OnDestroy {
  readonly canvas =
    viewChild.required<ElementRef<HTMLCanvasElement>>("gameCanvas");
  readonly gestureContainer =
    viewChild.required<ElementRef<HTMLDivElement>>("gestureContainer");
  readonly containerElement =
    viewChild.required<ElementRef<HTMLDivElement>>("containerElement");

  readonly #gameState = inject(GameState);
  readonly #progression = inject(Progression);
  readonly #router = inject(Router);
  readonly #gestureController = inject(GestureController);
  readonly #store = inject(Store);

  readonly canvasElement = computed<HTMLCanvasElement>(
    () => this.canvas().nativeElement,
  );

  readonly context = computed<CanvasRenderingContext2D | null>(() =>
    this.canvasElement().getContext("2d"),
  );

  // Expose gameState for template
  get gameState() {
    return this.#gameState;
  }

  #gesture?: Gesture;
  #gameLoopId?: number;
  #lastUpdateTime = 0;
  #accumulatorMs = 0;
  #autoSaveIntervalId?: number;
  #lastAutoSaveTime = 0;
  readonly #fixedDeltaMs = 1000 / 60; // 60 FPS simulation step
  readonly #autoSaveIntervalMs = 5000; // Auto-save every 5 seconds

  readonly coinsEarned = signal(0);

  // UI state
  readonly isTurboActive = signal(false);

  readonly iconPause = faPause;
  readonly iconBolt = faBolt;
  readonly iconStar = faStar;

  // Button layout (pixels)
  readonly #buttonSizePx = 56;
  readonly #buttonMarginPx = 16;

  // Snake head position in screen/canvas pixels
  readonly headScreenPosition = computed(() => {
    const snake = this.#gameState.snake();
    if (snake.length === 0) return { x: -9999, y: -9999 };
    const head = snake[0];
    const gridSize = this.#gameState.gridSize();
    const camera = this.#gameState.camera();
    return {
      x: (head.x - camera.x) * gridSize,
      y: (head.y - camera.y) * gridSize,
    };
  });

  // Button centers in canvas pixels
  readonly pauseButtonCenter = computed(() => {
    const y =
      this.#gameState.canvasHeight() -
      (this.#buttonMarginPx + this.#buttonSizePx / 2);
    const x = this.#buttonMarginPx + this.#buttonSizePx / 2;
    return { x, y };
  });

  readonly turboButtonCenter = computed(() => {
    const y =
      this.#gameState.canvasHeight() -
      (this.#buttonMarginPx + this.#buttonSizePx / 2);
    const x = this.#gameState.canvasWidth() / 2;
    return { x, y };
  });

  readonly specialButtonCenter = computed(() => {
    const y =
      this.#gameState.canvasHeight() -
      (this.#buttonMarginPx + this.#buttonSizePx / 2);
    const x =
      this.#gameState.canvasWidth() -
      (this.#buttonMarginPx + this.#buttonSizePx / 2);
    return { x, y };
  });

  // Opacity based on snake head proximity (smoothly fades to 0.4 when close)
  readonly pauseOpacity = computed(() =>
    this.#opacityForCenter(this.pauseButtonCenter()),
  );
  readonly turboOpacity = computed(() =>
    this.#opacityForCenter(this.turboButtonCenter()),
  );
  readonly specialOpacity = computed(() =>
    this.#opacityForCenter(this.specialButtonCenter()),
  );

  constructor() {
    // Watch for food eaten events to update coin counter
    effect(() => {
      const foodEaten = this.#gameState.foodEatenEvent();
      if (foodEaten) {
        this.coinsEarned.update((coins) => coins + foodEaten.value);
        this.#progression.earnNoodleCoins(foodEaten.value);
        // Clear the event
        this.#gameState.foodEatenEvent.set(null);
      }
    });
  }

  // Event handlers as private methods for proper cleanup
  readonly #handleResize = () => {
    this.setupResponsiveCanvas();
  };

  readonly #handleOrientationChange = () => {
    setTimeout(() => {
      this.setupResponsiveCanvas();
    }, 100);
  };

  readonly #handleKeyboard = (event: KeyboardEvent) => {
    handleKeyboard(event, this.#gameState);
  };

  ngAfterViewInit(): void {
    this.setupResponsiveCanvas();
    this.initializeCanvas();
    this.setupGestures();
    this.setupAutoSave();

    // Listen for window resize events
    globalThis.addEventListener("resize", this.#handleResize);
    globalThis.addEventListener(
      "orientationchange",
      this.#handleOrientationChange,
    );
    // Initialize a new game only when there is no active/paused game
    const status = this.#gameState.gameStatus();
    if (this.#gameState.snake().length === 0 || status === "menu") {
      this.#gameState.startGame();
    }
  }

  ngOnDestroy(): void {
    // Pause the game when leaving the page so it can be resumed later
    if (this.#gameState.gameStatus() === "playing") {
      this.#gameState.pause();
      // Auto-save on route leave
      this.#autoSave();
    }
    if (this.#gameLoopId) {
      cancelAnimationFrame(this.#gameLoopId);
    }
    if (this.#autoSaveIntervalId) {
      clearInterval(this.#autoSaveIntervalId);
    }
    this.#gesture?.destroy();
    document.removeEventListener("keydown", this.#handleKeyboard);
    document.body.style.overflow = ""; // Restore scrolling
    globalThis.removeEventListener("resize", this.#handleResize);
    globalThis.removeEventListener(
      "orientationchange",
      this.#handleOrientationChange,
    );
  }

  private setupResponsiveCanvas(): void {
    const maxWidth = this.gameState.worldSize().width;
    const maxHeight = this.gameState.worldSize().height;
    const container = this.containerElement().nativeElement;
    const rect = container.getBoundingClientRect();
    const width = Math.floor(Math.min(rect.width, maxWidth));
    const height = Math.floor(Math.min(rect.height, maxHeight));
    this.#gameState.updateCanvasSize(width, height - 8);
  }

  private setupGestures(): void {
    this.#gesture = this.#gestureController.create(
      {
        passive: false,
        el: this.gestureContainer().nativeElement,
        gestureName: "swipe",
        maxAngle: 90,
        threshold: 15, // Minimum distance for swipe recognition
        onEnd: (event) => {
          handleSwipe(event, this.#gameState);
        },
        // Add more responsive touch handling
        onStart: () => {
          // Prevent scrolling during game
          document.body.style.overflow = "hidden";
        },
      },
      true,
    );
    // Enable gesture
    this.#gesture.enable();

    // Add keyboard support for development/testing
    document.addEventListener("keydown", this.#handleKeyboard);
  }

  private setupAutoSave(): void {
    // Set up interval auto-save while playing
    this.#autoSaveIntervalId = setInterval(() => {
      if (this.#gameState.gameStatus() === "playing") {
        this.#autoSave();
      }
    }, this.#autoSaveIntervalMs);

    // Save on visibility change (tab switch, minimize)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && this.#gameState.gameStatus() === "playing") {
        this.#autoSave();
      }
    });

    // Save before page unload (refresh, close, etc.)
    globalThis.addEventListener("beforeunload", () => {
      if (this.#gameState.gameStatus() === "playing") {
        this.#autoSave();
      }
    });
  }

  #autoSave(): void {
    // Debounce saves to avoid excessive writes within the same frame
    const now = Date.now();
    if (now - this.#lastAutoSaveTime < 1000) return; // Don't save more than once per second

    this.#lastAutoSaveTime = now;
    this.#store.writeSavedGame(this.#gameState.toSavedGame());
  }

  private initializeCanvas(): void {
    const context = this.context();

    if (!context) {
      console.error("Could not get canvas context");
      return;
    }

    // Enable image smoothing for better mobile performance
    context.imageSmoothingEnabled = false;
    this.startGameLoop();

    // If returning while paused or game over, do not change status here
  }

  private startGameLoop(): void {
    const gameLoop = (currentTime: number) => {
      if (this.#lastUpdateTime === 0) {
        this.#lastUpdateTime = currentTime;
      }

      let frameTime = currentTime - this.#lastUpdateTime;
      // Avoid spiral of death after tab restore/background
      if (frameTime > 250) frameTime = 250;
      this.#lastUpdateTime = currentTime;

      // If not playing, don't accumulate simulation time to prevent catch-up
      if (this.#gameState.gameStatus() === "playing") {
        this.#accumulatorMs += frameTime;
      } else {
        this.#accumulatorMs = 0;
      }

      while (this.#accumulatorMs >= this.#fixedDeltaMs) {
        if (this.#gameState.gameStatus() === "playing") {
          this.#gameState.updateMovement(this.#fixedDeltaMs);
          // Advance game clock in fixed steps
          this.#gameState.gameTime.update(
            (time) => time + this.#fixedDeltaMs / 1000,
          );
        }
        this.#accumulatorMs -= this.#fixedDeltaMs;
      }

      // Render every frame for smooth visuals
      this.render();

      this.#gameLoopId = requestAnimationFrame(gameLoop);
    };

    this.#gameLoopId = requestAnimationFrame(gameLoop);
  }

  private updateGameTime(deltaTime: number): void {
    if (this.#gameState.gameStatus() !== "playing") return;

    // Update game time
    this.#gameState.gameTime.update((time) => time + deltaTime / 1000);
  }

  private render(): void {
    const context = this.context();
    if (!context) return;

    const canvas = this.canvasElement();
    const { width, height } = canvas;
    const gridSize = this.#gameState.gridSize();

    // Draw background with patterns for visual movement feedback
    drawBackgroundPattern(context, width, height, this.#gameState);

    // Only draw grid on larger screens to improve mobile performance
    if (width > 400) {
      drawGrid(context, width, height, gridSize);
    }

    // Draw world decorations for visual interest
    drawWorldDecorations(context, width, height, this.#gameState);

    // Draw game elements using viewport coordinates
    drawSnake(context, this.#gameState);
    drawFood(context, this.#gameState);

    // Draw food direction indicator when food is off-screen
    drawFoodDirectionIndicator(context, width, height, this.#gameState);

    // Draw edge shadows to indicate more content beyond screen
    drawEdgeShadows(context, width, height, this.#gameState);

    // Subtle turbo overlay when active
    if (this.isTurboActive()) {
      drawTurboOverlay(context, width, height, 0.18);
    }
  }

  // Game controls
  startGame(): void {
    // Clear any existing saved game before starting a new one
    this.#store.clearSavedGame();
    this.#gameState.score.set(0);
    this.#gameState.startGame();
    this.coinsEarned.set(0);
  }

  togglePause(): void {
    this.#gameState.pauseGame();
  }

  changeDirection(direction: Direction): void {
    this.#gameState.changeDirection(direction);
  }

  goBack(): void {
    // Pause instead of resetting so the game can be resumed when returning
    if (this.#gameState.gameStatus() === "playing") {
      this.#gameState.pause();
    }
    void this.#router.navigate(["/menu"]);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString()}:${secs.toString().padStart(2, "0")}`;
  }

  // Turbo press/hold handlers (gameplay effect to be implemented later)
  onTurboPressStart(): void {
    this.isTurboActive.set(true);
    this.#gameState.activateTurbo();
  }

  onTurboPressEnd(): void {
    this.isTurboActive.set(false);
    this.#gameState.deactivateTurbo();
  }

  onSpecialAction(): void {
    // Placeholder for future special action
  }

  onSaveAndExit(): void {
    // Save the current game state
    this.#store.writeSavedGame(this.#gameState.toSavedGame());
    // Navigate back to menu
    void this.#router.navigate(["/menu"]);
  }

  // Compute opacity for a given button center in canvas pixels
  #opacityForCenter(center: { x: number; y: number }): number {
    const head = this.headScreenPosition();
    const distance = Math.hypot(head.x - center.x, head.y - center.y);
    const fadeStart = this.#buttonSizePx * 2.5; // start fading when within ~2.5 button radii
    const minOpacity = 0.2;
    if (distance >= fadeStart) return 1;
    const t = Math.max(0, distance / fadeStart);
    return minOpacity + (1 - minOpacity) * t;
  }
}
