import {
  Component,
  ElementRef,
  viewChild,
  inject,
  OnInit,
  OnDestroy,
  AfterViewInit,
  signal,
} from "@angular/core";
import { Router } from "@angular/router";

import { GameState, Direction } from "../../services/game-state";
import { Progression } from "../../services/progression";

@Component({
  selector: "app-game-canvas",
  standalone: true,
  templateUrl: "./game-canvas.html",
})
export class GameCanvas implements OnInit, AfterViewInit, OnDestroy {
  readonly canvas =
    viewChild.required<ElementRef<HTMLCanvasElement>>("gameCanvas");

  private readonly _gameState = inject(GameState);
  private readonly progression = inject(Progression);
  private readonly router = inject(Router);

  // Expose gameState for template
  get gameState() {
    return this._gameState;
  }

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
    const canvas = this.canvas().nativeElement;
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
    if (this._gameState.gameStatus() !== "playing") return;

    // TODO: Implement snake movement, collision detection, food consumption
    // This is a placeholder for the actual game logic
    this._gameState.gameTime.update((time) => time + this.gameSpeed / 1000);
  }

  private render(): void {
    if (!this.ctx) return;

    const canvas = this.canvas().nativeElement;
    const { width, height } = canvas;
    const gridSize = this._gameState.gridSize();

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
    const snake = this._gameState.snake();
    const gridSize = this._gameState.gridSize();

    for (const [index, segment] of snake.entries()) {
      if (!this.ctx) continue;
      this.ctx.fillStyle = index === 0 ? "#1F2937" : "#374151"; // Head darker
      this.ctx.fillRect(
        segment.x * gridSize + 1,
        segment.y * gridSize + 1,
        gridSize - 2,
        gridSize - 2,
      );
    }
  }

  private drawFood(): void {
    if (!this.ctx) return;
    const food = this._gameState.food();
    const gridSize = this._gameState.gridSize();

    for (const item of food) {
      if (!this.ctx) continue;
      this.ctx.fillStyle = item.type === "golden" ? "#F59E0B" : "#EF4444"; // Golden or red
      this.ctx.fillRect(
        item.x * gridSize + 2,
        item.y * gridSize + 2,
        gridSize - 4,
        gridSize - 4,
      );
    }
  }

  // Game controls
  startGame(): void {
    this._gameState.startGame();
    this.coinsEarned.set(0);
  }

  togglePause(): void {
    this._gameState.pauseGame();
  }

  changeDirection(direction: Direction): void {
    this._gameState.changeDirection(direction);
  }

  goBack(): void {
    this._gameState.resetGame();
    void this.router.navigate(["/menu"]);
  }

  private handleKeyPress(event: KeyboardEvent): void {
    console.log("handleKeyPress", event);
    if (this._gameState.gameStatus() !== "playing") return;

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

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString()}:${secs.toString().padStart(2, "0")}`;
  }
}
