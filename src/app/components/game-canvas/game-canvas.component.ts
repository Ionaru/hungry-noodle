import {
  Component,
  ElementRef,
  ViewChild,
  inject,
  OnInit,
  OnDestroy,
  AfterViewInit,
  signal,
} from "@angular/core";
import { Router } from "@angular/router";
import { GameStateService, Direction } from "../../services/game-state.service";
import { ProgressionService } from "../../services/progression.service";

@Component({
  selector: "app-game-canvas",
  template: `
    <div class="flex min-h-screen flex-col bg-gray-900">
      <!-- Game HUD -->
      <div class="flex items-center justify-between bg-gray-800 p-4 text-white">
        <div class="flex gap-6">
          <div class="text-center">
            <div class="text-xl font-bold">{{ gameState.score() }}</div>
            <div class="text-xs opacity-75">Score</div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold">{{ gameState.currentLength() }}</div>
            <div class="text-xs opacity-75">Length</div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold">
              {{ formatTime(gameState.gameTime()) }}
            </div>
            <div class="text-xs opacity-75">Time</div>
          </div>
        </div>

        <div class="flex gap-2">
          <button
            (click)="togglePause()"
            class="rounded bg-blue-600 px-4 py-2 font-semibold transition-colors hover:bg-blue-700"
          >
            {{ gameState.gameStatus() === "paused" ? "▶️" : "⏸️" }}
          </button>
          <button
            (click)="goBack()"
            class="rounded bg-red-600 px-4 py-2 font-semibold transition-colors hover:bg-red-700"
          >
            🏠 Menu
          </button>
        </div>
      </div>

      <!-- Game Canvas Container -->
      <div class="flex flex-1 items-center justify-center p-4">
        <div class="relative">
          <canvas
            #gameCanvas
            class="rounded-lg border-4 border-white bg-green-100 shadow-2xl"
            [width]="gameState.canvasWidth()"
            [height]="gameState.canvasHeight()"
          >
          </canvas>

          <!-- Game Status Overlay -->
          @if (gameState.gameStatus() !== "playing") {
            <div
              class="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50"
            >
              <div class="max-w-sm rounded-xl bg-white p-8 text-center">
                @switch (gameState.gameStatus()) {
                  @case ("menu") {
                    <h2 class="mb-4 text-2xl font-bold">🐍 Ready to Play?</h2>
                    <button
                      (click)="startGame()"
                      class="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700"
                    >
                      Start Game
                    </button>
                  }
                  @case ("paused") {
                    <h2 class="mb-4 text-2xl font-bold">⏸️ Game Paused</h2>
                    <button
                      (click)="togglePause()"
                      class="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                      Resume
                    </button>
                  }
                  @case ("gameOver") {
                    <h2 class="mb-4 text-2xl font-bold">🎮 Game Over!</h2>
                    <div class="mb-4 space-y-2">
                      <div>
                        Final Score: <strong>{{ gameState.score() }}</strong>
                      </div>
                      <div>
                        Final Length:
                        <strong>{{ gameState.currentLength() }}</strong>
                      </div>
                      <div>
                        Coins Earned: <strong>+{{ coinsEarned() }}</strong> 🪙
                      </div>
                    </div>
                    <div class="flex gap-2">
                      <button
                        (click)="startGame()"
                        class="rounded bg-green-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-green-700"
                      >
                        Play Again
                      </button>
                      <button
                        (click)="goBack()"
                        class="rounded bg-gray-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-gray-700"
                      >
                        Menu
                      </button>
                    </div>
                  }
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class GameCanvasComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("gameCanvas", { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;

  readonly gameState = inject(GameStateService);
  private readonly progressionService = inject(ProgressionService);
  private readonly router = inject(Router);

  private ctx?: CanvasRenderingContext2D;
  private gameLoopId?: number;
  private lastUpdateTime = 0;
  private readonly gameSpeed = 150; // milliseconds between updates

  readonly coinsEarned = signal(0);

  ngOnInit(): void {
    // Set up keyboard controls
    document.addEventListener("keydown", this.handleKeyPress.bind(this));
  }

  ngAfterViewInit(): void {
    this.initializeCanvas();
  }

  ngOnDestroy(): void {
    document.removeEventListener("keydown", this.handleKeyPress.bind(this));
    if (this.gameLoopId) {
      cancelAnimationFrame(this.gameLoopId);
    }
  }

  private initializeCanvas(): void {
    const canvas = this.canvas.nativeElement;
    const context = canvas.getContext("2d");

    if (!context) {
      console.error("Could not get canvas context");
      return;
    }

    this.ctx = context;
    this.startGameLoop();
  }

  private startGameLoop(): void {
    const gameLoop = (currentTime: number) => {
      if (currentTime - this.lastUpdateTime >= this.gameSpeed) {
        this.update();
        this.render();
        this.lastUpdateTime = currentTime;
      }

      this.gameLoopId = requestAnimationFrame(gameLoop);
    };

    this.gameLoopId = requestAnimationFrame(gameLoop);
  }

  private update(): void {
    if (this.gameState.gameStatus() !== "playing") return;

    // TODO: Implement snake movement, collision detection, food consumption
    // This is a placeholder for the actual game logic
    this.gameState.gameTime.update((time) => time + this.gameSpeed / 1000);
  }

  private render(): void {
    if (!this.ctx) return;

    const canvas = this.canvas.nativeElement;
    const { width, height } = canvas;
    const gridSize = this.gameState.gridSize();

    // Clear canvas
    this.ctx.fillStyle = "#10B981"; // Green background
    this.ctx.fillRect(0, 0, width, height);

    // Draw grid (optional)
    this.ctx.strokeStyle = "#059669";
    this.ctx.lineWidth = 1;

    for (let x = 0; x <= width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }

    for (let y = 0; y <= height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }

    // Draw snake
    this.drawSnake();

    // Draw food
    this.drawFood();
  }

  private drawSnake(): void {
    const snake = this.gameState.snake();
    const gridSize = this.gameState.gridSize();

    snake.forEach((segment, index) => {
      if (!this.ctx) return;
      this.ctx.fillStyle = index === 0 ? "#1F2937" : "#374151"; // Head darker
      this.ctx.fillRect(
        segment.x * gridSize + 1,
        segment.y * gridSize + 1,
        gridSize - 2,
        gridSize - 2,
      );
    });
  }

  private drawFood(): void {
    if (!this.ctx) return;
    const food = this.gameState.food();
    const gridSize = this.gameState.gridSize();

    food.forEach((item) => {
      if (!this.ctx) return;
      this.ctx.fillStyle = item.type === "golden" ? "#F59E0B" : "#EF4444"; // Golden or red
      this.ctx.fillRect(
        item.x * gridSize + 2,
        item.y * gridSize + 2,
        gridSize - 4,
        gridSize - 4,
      );
    });
  }

  // Game controls
  startGame(): void {
    this.gameState.startGame();
    this.coinsEarned.set(0);
  }

  togglePause(): void {
    this.gameState.pauseGame();
  }

  changeDirection(direction: Direction): void {
    this.gameState.changeDirection(direction);
  }

  goBack(): void {
    this.gameState.resetGame();
    void this.router.navigate(["/menu"]);
  }

  private handleKeyPress(event: KeyboardEvent): void {
    console.log("handleKeyPress", event);
    if (this.gameState.gameStatus() !== "playing") return;

    switch (event.key) {
      case "ArrowUp":
      case "w":
      case "W":
        event.preventDefault();
        this.changeDirection("up");
        break;
      case "ArrowDown":
      case "s":
      case "S":
        event.preventDefault();
        this.changeDirection("down");
        break;
      case "ArrowLeft":
      case "a":
      case "A":
        event.preventDefault();
        this.changeDirection("left");
        break;
      case "ArrowRight":
      case "d":
      case "D":
        event.preventDefault();
        this.changeDirection("right");
        break;
      case " ":
        event.preventDefault();
        this.togglePause();
        break;
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString()}:${secs.toString().padStart(2, "0")}`;
  }
}
