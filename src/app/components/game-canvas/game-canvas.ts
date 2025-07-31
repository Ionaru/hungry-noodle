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
  standalone: true,
  templateUrl: "./game-canvas.html",
})
export class GameCanvas implements AfterViewInit, OnDestroy {
  readonly canvas =
    viewChild.required<ElementRef<HTMLCanvasElement>>("gameCanvas");
  readonly gestureContainer =
    viewChild.required<ElementRef<HTMLDivElement>>("gestureContainer");

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

  ngAfterViewInit(): void {
    this.initializeCanvas();
    this.#gesture = this.#gestureController.create(
      {
        passive: false,
        maxAngle: 90,
        el: this.gestureContainer().nativeElement,
        gestureName: "swipe",
        // onStart: (event) => {
        //   console.log("swipe started", event);
        // },
        // onMove: (event) => {
        //   console.log("swipe moved", event);
        // },
        onEnd: (event) => {
          console.log("swipe ended", event.deltaX, event.deltaY);
          this.handleSwipe(event);
        },
      },
      true,
    );
  }

  ngOnDestroy(): void {
    if (this.#gameLoopId) {
      cancelAnimationFrame(this.#gameLoopId);
    }
    this.#gesture?.destroy();
  }

  private initializeCanvas(): void {
    const canvas = this.canvas().nativeElement;
    const context = canvas.getContext("2d");

    if (!context) {
      console.error("Could not get canvas context");
      return;
    }

    this.#ctx = context;
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

    // TODO: Implement snake movement, collision detection, food consumption
    // This is a placeholder for the actual game logic
    this.#gameState.gameTime.update((time) => time + this.#gameSpeed / 1000);
  }

  private render(): void {
    if (!this.#ctx) return;

    const canvas = this.canvas().nativeElement;
    const { width, height } = canvas;
    const gridSize = this.#gameState.gridSize();

    // Clear canvas
    this.#ctx.fillStyle = "#10B981"; // Green background
    this.#ctx.fillRect(0, 0, width, height);

    // Draw grid (optional)
    this.#ctx.strokeStyle = "#059669";
    this.#ctx.lineWidth = 1;

    for (let x = 0; x <= width; x += gridSize) {
      this.#ctx.beginPath();
      this.#ctx.moveTo(x, 0);
      this.#ctx.lineTo(x, height);
      this.#ctx.stroke();
    }

    for (let y = 0; y <= height; y += gridSize) {
      this.#ctx.beginPath();
      this.#ctx.moveTo(0, y);
      this.#ctx.lineTo(width, y);
      this.#ctx.stroke();
    }

    // Draw snake
    this.drawSnake();

    // Draw food
    this.drawFood();
  }

  private drawSnake(): void {
    const snake = this.#gameState.snake();
    const gridSize = this.#gameState.gridSize();

    for (const [index, segment] of snake.entries()) {
      if (!this.#ctx) continue;
      this.#ctx.fillStyle = index === 0 ? "#1F2937" : "#374151"; // Head darker
      this.#ctx.fillRect(
        segment.x * gridSize + 1,
        segment.y * gridSize + 1,
        gridSize - 2,
        gridSize - 2,
      );
    }
  }

  private drawFood(): void {
    if (!this.#ctx) return;
    const food = this.#gameState.food();
    const gridSize = this.#gameState.gridSize();

    for (const item of food) {
      this.#ctx.fillStyle = item.type === "golden" ? "#F59E0B" : "#EF4444"; // Golden or red
      this.#ctx.fillRect(
        item.x * gridSize + 2,
        item.y * gridSize + 2,
        gridSize - 4,
        gridSize - 4,
      );
    }
  }

  // Game controls
  startGame(): void {
    this.#gameState.startGame();
    this.#gesture?.enable();
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

    // Determine the direction of the swipe, in arcs of 90 degrees
    const isUp = deltaY < 0 && Math.abs(deltaX) < Math.abs(deltaY);
    const isDown = deltaY > 0 && Math.abs(deltaX) < Math.abs(deltaY);
    const isLeft = deltaX < 0 && Math.abs(deltaX) > Math.abs(deltaY);
    const isRight = deltaX > 0 && Math.abs(deltaX) > Math.abs(deltaY);

    if (isUp) {
      this.changeDirection("up");
    } else if (isDown) {
      this.changeDirection("down");
    } else if (isLeft) {
      this.changeDirection("left");
    } else if (isRight) {
      this.changeDirection("right");
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString()}:${secs.toString().padStart(2, "0")}`;
  }
}
