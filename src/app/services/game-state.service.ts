import { Injectable, signal, computed } from "@angular/core";

export interface SnakeSegment {
  x: number;
  y: number;
}

export interface Food {
  x: number;
  y: number;
  type: "normal" | "golden" | "special";
  value: number;
}

export type GameStatus = "menu" | "playing" | "paused" | "gameOver";
export type Direction = "up" | "down" | "left" | "right";

@Injectable({
  providedIn: "root",
})
export class GameStateService {
  // Core game state signals
  readonly score = signal(0);
  readonly snake = signal<SnakeSegment[]>([]);
  readonly food = signal<Food[]>([]);
  readonly gameStatus = signal<GameStatus>("menu");
  readonly direction = signal<Direction>("right");
  readonly gameTime = signal(0);

  // Canvas and game settings
  readonly canvasWidth = signal(800);
  readonly canvasHeight = signal(600);
  readonly gridSize = signal(20);

  // Game statistics
  readonly currentLength = computed(() => this.snake().length);
  readonly highScore = computed(() => {
    // TODO: Load from persistent storage
    return Math.max(this.score(), 0);
  });

  // Computed canvas properties
  readonly canvasSize = computed(() => ({
    width: this.canvasWidth(),
    height: this.canvasHeight(),
    gridWidth: Math.floor(this.canvasWidth() / this.gridSize()),
    gridHeight: Math.floor(this.canvasHeight() / this.gridSize()),
  }));

  // Game actions
  startGame(): void {
    this.initializeGame();
    this.gameStatus.set("playing");
  }

  pauseGame(): void {
    if (this.gameStatus() === "playing") {
      this.gameStatus.set("paused");
    } else if (this.gameStatus() === "paused") {
      this.gameStatus.set("playing");
    }
  }

  endGame(): void {
    this.gameStatus.set("gameOver");
    // TODO: Save high score, update statistics
  }

  resetGame(): void {
    this.score.set(0);
    this.gameTime.set(0);
    this.initializeGame();
    this.gameStatus.set("menu");
  }

  changeDirection(newDirection: Direction): void {
    const current = this.direction();

    // Prevent reverse direction
    const opposites: Record<Direction, Direction> = {
      up: "down",
      down: "up",
      left: "right",
      right: "left",
    };

    if (opposites[current] !== newDirection) {
      this.direction.set(newDirection);
    }
  }

  updateScore(points: number): void {
    this.score.update((current) => current + points);
  }

  // Private initialization methods
  private initializeGame(): void {
    const centerX = Math.floor(this.canvasSize().gridWidth / 2);
    const centerY = Math.floor(this.canvasSize().gridHeight / 2);

    // Initialize snake in center
    this.snake.set([
      { x: centerX, y: centerY },
      { x: centerX - 1, y: centerY },
      { x: centerX - 2, y: centerY },
    ]);

    this.direction.set("right");
    this.spawnFood();
  }

  private spawnFood(): void {
    const gridWidth = this.canvasSize().gridWidth;
    const gridHeight = this.canvasSize().gridHeight;
    const snake = this.snake();

    let foodPosition: { x: number; y: number };

    // Find empty position for food
    do {
      foodPosition = {
        x: Math.floor(Math.random() * gridWidth),
        y: Math.floor(Math.random() * gridHeight),
      };
    } while (
      snake.some(
        (segment) =>
          segment.x === foodPosition.x && segment.y === foodPosition.y,
      )
    );

    const food: Food = {
      x: foodPosition.x,
      y: foodPosition.y,
      type: Math.random() < 0.1 ? "golden" : "normal",
      value: Math.random() < 0.1 ? 5 : 1,
    };

    this.food.set([food]);
  }
}
