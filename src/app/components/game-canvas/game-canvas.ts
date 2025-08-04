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
import { Gesture, GestureController } from "@ionic/angular/standalone";

import { handleKeyboard } from "../../controls/keyboard";
import { handleSwipe } from "../../controls/swipe";
import { drawBackgroundPattern } from "../../drawing/background";
import { drawFoodDirectionIndicator } from "../../drawing/direction-indicator";
import { drawEdgeShadows } from "../../drawing/edge-shadows";
import { drawFood } from "../../drawing/food";
import { drawGrid } from "../../drawing/grid";
import { drawSnake } from "../../drawing/snake";
import { drawWorldDecorations } from "../../drawing/world-decorations";
import { GameState, Direction } from "../../services/game-state";
import { Progression } from "../../services/progression";

@Component({
  selector: "app-game-canvas",
  templateUrl: "./game-canvas.html",
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

  readonly coinsEarned = signal(0);

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

    // Listen for window resize events
    globalThis.addEventListener("resize", this.#handleResize);
    globalThis.addEventListener(
      "orientationchange",
      this.#handleOrientationChange,
    );
  }

  ngOnDestroy(): void {
    if (this.#gameLoopId) {
      cancelAnimationFrame(this.#gameLoopId);
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
    const container = this.containerElement().nativeElement;
    const rect = container.getBoundingClientRect();
    this.#gameState.updateCanvasSize(rect.width, rect.height);
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

  private initializeCanvas(): void {
    const context = this.context();

    if (!context) {
      console.error("Could not get canvas context");
      return;
    }

    // Enable image smoothing for better mobile performance
    context.imageSmoothingEnabled = false;
    this.startGameLoop();
  }

  private startGameLoop(): void {
    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - this.#lastUpdateTime;

      // Update continuous movement every frame
      if (this.#gameState.gameStatus() === "playing") {
        this.#gameState.updateMovement(deltaTime);
      }

      // Update game time
      if (deltaTime >= 16) {
        // ~60fps
        this.updateGameTime(deltaTime);
        this.#lastUpdateTime = currentTime;
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
  }

  // Game controls
  startGame(): void {
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
    this.#gameState.resetGame();
    void this.#router.navigate(["/menu"]);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString()}:${secs.toString().padStart(2, "0")}`;
  }

  private handleGameOver(): void {
    // Update progression stats
    this.#progression.updateStats({
      gamesPlayed: this.#progression.playerStats().gamesPlayed + 1,
      totalScore:
        this.#progression.playerStats().totalScore + this.#gameState.score(),
      highScore: Math.max(
        this.#progression.playerStats().highScore,
        this.#gameState.score(),
      ),
      totalLength:
        this.#progression.playerStats().totalLength +
        this.#gameState.currentLength(),
      playTime:
        this.#progression.playerStats().playTime + this.#gameState.gameTime(),
    });
  }
}
