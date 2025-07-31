import {
  Component,
  ElementRef,
  viewChild,
  inject,
  OnDestroy,
  AfterViewInit,
  signal,
} from "@angular/core";
import { Router } from "@angular/router";
import {
  Gesture,
  GestureController,
  GestureDetail,
} from "@ionic/angular/standalone";

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

  // Expose gameState for template
  get gameState() {
    return this.#gameState;
  }

  #ctx?: CanvasRenderingContext2D;
  #gesture?: Gesture;
  #gameLoopId?: number;
  #lastUpdateTime = 0;
  readonly #gameSpeed = 150; // milliseconds between update

  readonly coinsEarned = signal(0);

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
    this.handleKeyboard(event);
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
          this.handleSwipe(event);
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

  private handleKeyboard(event: KeyboardEvent): void {
    if (this.#gameState.gameStatus() !== "playing") return;

    switch (event.key) {
      case "ArrowUp":
      case "w":
      case "W": {
        event.preventDefault();
        this.changeDirection("up");
        break;
      }
      case "ArrowDown":
      case "s":
      case "S": {
        event.preventDefault();
        this.changeDirection("down");
        break;
      }
      case "ArrowLeft":
      case "a":
      case "A": {
        event.preventDefault();
        this.changeDirection("left");
        break;
      }
      case "ArrowRight":
      case "d":
      case "D": {
        event.preventDefault();
        this.changeDirection("right");
        break;
      }
      case " ": {
        event.preventDefault();
        this.togglePause();
        break;
      }
    }
  }

  private initializeCanvas(): void {
    const canvas = this.canvas().nativeElement;
    const context = canvas.getContext("2d");

    if (!context) {
      console.error("Could not get canvas context");
      return;
    }

    this.#ctx = context;
    // Enable image smoothing for better mobile performance
    context.imageSmoothingEnabled = false;
    this.startGameLoop();
  }

  private startGameLoop(): void {
    const gameLoop = (currentTime: number) => {
      if (currentTime - this.#lastUpdateTime >= this.#gameSpeed) {
        this.update();
        this.render();
        this.#lastUpdateTime = currentTime;
      }

      this.#gameLoopId = requestAnimationFrame(gameLoop);
    };

    this.#gameLoopId = requestAnimationFrame(gameLoop);
  }

  private update(): void {
    if (this.#gameState.gameStatus() !== "playing") return;

    // Update game time
    this.#gameState.gameTime.update((time) => time + this.#gameSpeed / 1000);

    // Move snake
    this.#gameState.moveSnake();

    // Check for collisions
    if (this.#gameState.checkCollision()) {
      this.#gameState.endGame();
      this.handleGameOver();
      return;
    }

    // Check for food consumption
    const foodEaten = this.#gameState.checkFoodConsumption();
    if (foodEaten) {
      this.#gameState.updateScore(foodEaten.value);
      this.coinsEarned.update((coins) => coins + foodEaten.value);
      this.#progression.earnNoodleCoins(foodEaten.value);
      this.#gameState.spawnFood();
    }
  }

  private render(): void {
    if (!this.#ctx) return;

    const canvas = this.canvas().nativeElement;
    const { width, height } = canvas;
    const gridSize = this.#gameState.gridSize();

    // Clear canvas with solid color for better mobile performance
    this.#ctx.fillStyle = "#10B981"; // Green background
    this.#ctx.fillRect(0, 0, width, height);

    // Only draw grid on larger screens to improve mobile performance
    if (width > 400) {
      this.drawGrid(width, height, gridSize);
    }

    // Draw game elements
    this.drawSnake();
    this.drawFood();
  }

  private drawGrid(width: number, height: number, gridSize: number): void {
    if (!this.#ctx) return;

    this.#ctx.strokeStyle = "#059669";
    this.#ctx.lineWidth = 1;
    this.#ctx.globalAlpha = 0.3; // Make grid more subtle

    this.#ctx.beginPath();

    // Draw vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      this.#ctx.moveTo(x, 0);
      this.#ctx.lineTo(x, height);
    }

    // Draw horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      this.#ctx.moveTo(0, y);
      this.#ctx.lineTo(width, y);
    }

    this.#ctx.stroke();
    this.#ctx.globalAlpha = 1; // Reset alpha
  }

  private drawSnake(): void {
    if (!this.#ctx) return;

    const snake = this.#gameState.snake();
    const gridSize = this.#gameState.gridSize();

    // Optimize by batching rectangle draws
    this.#ctx.save();

    // Draw snake body first (batch all body segments)
    if (snake.length > 1) {
      this.#ctx.fillStyle = "#374151";
      for (let index = 1; index < snake.length; index++) {
        const segment = snake[index];
        this.#ctx.fillRect(
          segment.x * gridSize + 1,
          segment.y * gridSize + 1,
          gridSize - 2,
          gridSize - 2,
        );
      }
    }

    // Draw head separately with different color and rounding for better mobile look
    if (snake.length > 0) {
      const head = snake[0];
      this.#ctx.fillStyle = "#1F2937";

      // Use rounded rectangles for head on mobile for better appearance
      const x = head.x * gridSize + 1;
      const y = head.y * gridSize + 1;
      const size = gridSize - 2;
      const radius = Math.min(4, size / 4);

      this.drawRoundedRect(x, y, size, size, radius);
      this.#ctx.fill();
    }

    this.#ctx.restore();
  }

  private drawRoundedRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ): void {
    if (!this.#ctx) return;

    this.#ctx.beginPath();
    this.#ctx.moveTo(x + radius, y);
    this.#ctx.lineTo(x + width - radius, y);
    this.#ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.#ctx.lineTo(x + width, y + height - radius);
    this.#ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius,
      y + height,
    );
    this.#ctx.lineTo(x + radius, y + height);
    this.#ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.#ctx.lineTo(x, y + radius);
    this.#ctx.quadraticCurveTo(x, y, x + radius, y);
    this.#ctx.closePath();
  }

  private drawFood(): void {
    if (!this.#ctx) return;

    const food = this.#gameState.food();
    const gridSize = this.#gameState.gridSize();

    // Enhanced food rendering for mobile
    for (const item of food) {
      const x = item.x * gridSize + 2;
      const y = item.y * gridSize + 2;
      const size = gridSize - 4;

      if (item.type === "golden") {
        // Golden food with glow effect
        this.#ctx.save();
        this.#ctx.shadowColor = "#F59E0B";
        this.#ctx.shadowBlur = 8;
        this.#ctx.fillStyle = "#F59E0B";
        this.drawRoundedRect(x, y, size, size, size / 3);
        this.#ctx.fill();
        this.#ctx.restore();
      } else {
        // Regular food
        this.#ctx.fillStyle = "#EF4444";
        this.drawRoundedRect(x, y, size, size, size / 4);
        this.#ctx.fill();
      }
    }
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

  private handleSwipe(event: GestureDetail): void {
    if (this.#gameState.gameStatus() !== "playing") return;

    const { deltaX, deltaY } = event;

    // Require minimum swipe distance for better mobile UX
    const minSwipeDistance = 30;
    const swipeDistance = Math.hypot(deltaX, deltaY);

    if (swipeDistance < minSwipeDistance) {
      return; // Ignore short swipes
    }

    // Determine the direction of the swipe with improved logic
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Use a threshold to determine if it's more horizontal or vertical
    const threshold = 0.6; // Requires 60% dominance in one direction

    if (absDeltaY > absDeltaX * threshold) {
      // Vertical swipe
      if (deltaY < 0) {
        this.changeDirection("up");
      } else {
        this.changeDirection("down");
      }
    } else if (absDeltaX > absDeltaY * threshold) {
      // Horizontal swipe
      if (deltaX < 0) {
        this.changeDirection("left");
      } else {
        this.changeDirection("right");
      }
    }
    // If neither direction is dominant enough, ignore the swipe
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
