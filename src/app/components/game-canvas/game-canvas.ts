import {
  Component,
  ElementRef,
  viewChild,
  inject,
  OnDestroy,
  AfterViewInit,
  signal,
  effect,
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
      const deltaTime = currentTime - this.#lastUpdateTime;

      // Update continuous movement every frame
      if (this.#gameState.gameStatus() === "playing") {
        this.#gameState.updateMovement(deltaTime);
      }

      // Update game time
      if (deltaTime >= 16) { // ~60fps
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
    if (!this.#ctx) return;

    const canvas = this.canvas().nativeElement;
    const { width, height } = canvas;
    const gridSize = this.#gameState.gridSize();

    // Draw background with patterns for visual movement feedback
    this.drawBackgroundPattern();

    // Only draw grid on larger screens to improve mobile performance
    if (width > 400) {
      this.drawGrid(width, height, gridSize);
    }

        // Draw world decorations for visual interest
    this.drawWorldDecorations();

        // Draw game elements using viewport coordinates
    this.drawSnake();
    this.drawFood();

    // Draw food direction indicator when food is off-screen
    this.drawFoodDirectionIndicator();

    // Draw edge shadows to indicate more content beyond screen
    this.drawEdgeShadows();
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
    const camera = this.#gameState.camera();
    const viewport = this.#gameState.viewport();

    // Optimize by batching rectangle draws
    this.#ctx.save();

    // Draw snake body first (batch all body segments that are visible)
    if (snake.length > 1) {
      this.#ctx.fillStyle = "#374151";
      for (let index = 1; index < snake.length; index++) {
        const segment = snake[index];

        // Check if segment is within viewport (with some margin for smooth positions)
        if (
          segment.x >= viewport.left - 1 &&
          segment.x < viewport.right + 1 &&
          segment.y >= viewport.top - 1 &&
          segment.y < viewport.bottom + 1
        ) {
          // Convert smooth world coordinates to screen coordinates
          const screenX = (segment.x - camera.x) * gridSize + 1;
          const screenY = (segment.y - camera.y) * gridSize + 1;

          this.#ctx.fillRect(
            screenX,
            screenY,
            gridSize - 2,
            gridSize - 2,
          );
        }
      }
    }

    // Draw head separately with different color and rounding for better mobile look
    if (snake.length > 0) {
      const head = snake[0];
      this.#ctx.fillStyle = "#1F2937";

      // Convert smooth world coordinates to screen coordinates
      const screenX = (head.x - camera.x) * gridSize + 1;
      const screenY = (head.y - camera.y) * gridSize + 1;
      const size = gridSize - 2;
      const radius = Math.min(4, size / 4);

      this.drawRoundedRect(screenX, screenY, size, size, radius);
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
    const camera = this.#gameState.camera();
    const viewport = this.#gameState.viewport();

    // Enhanced food rendering for mobile - only draw visible food
    for (const item of food) {
      // Check if food is within viewport
      if (
        item.x >= viewport.left &&
        item.x < viewport.right &&
        item.y >= viewport.top &&
        item.y < viewport.bottom
      ) {
        // Convert world coordinates to screen coordinates
        const screenX = (item.x - camera.x) * gridSize + 2;
        const screenY = (item.y - camera.y) * gridSize + 2;
        const size = gridSize - 4;

        if (item.type === "golden") {
          // Golden food with glow effect
          this.#ctx.save();
          this.#ctx.shadowColor = "#F59E0B";
          this.#ctx.shadowBlur = 8;
          this.#ctx.fillStyle = "#F59E0B";
          this.drawRoundedRect(screenX, screenY, size, size, size / 3);
          this.#ctx.fill();
          this.#ctx.restore();
        } else {
          // Regular food
          this.#ctx.fillStyle = "#EF4444";
          this.drawRoundedRect(screenX, screenY, size, size, size / 4);
          this.#ctx.fill();
        }
      }
    }
  }

  private drawEdgeShadows(): void {
    if (!this.#ctx) return;

    const canvas = this.canvas().nativeElement;
    const { width, height } = canvas;
    const viewport = this.#gameState.viewport();
    const worldSize = this.#gameState.worldSize();

    // Shadow properties
    const shadowSize = 20; // Shadow depth in pixels
    const shadowOpacity = 0.3; // Shadow opacity

    this.#ctx.save();

    // Top shadow - show if there's content above viewport
    if (viewport.top > 0) {
      const gradient = this.#ctx.createLinearGradient(0, 0, 0, shadowSize);
      gradient.addColorStop(0, 'rgba(0, 0, 0, ' + shadowOpacity.toString() + ')');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      this.#ctx.fillStyle = gradient;
      this.#ctx.fillRect(0, 0, width, shadowSize);
    }

    // Bottom shadow - show if there's content below viewport
    if (viewport.bottom < worldSize.gridHeight) {
      const gradient = this.#ctx.createLinearGradient(0, height - shadowSize, 0, height);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, ' + shadowOpacity.toString() + ')');
      this.#ctx.fillStyle = gradient;
      this.#ctx.fillRect(0, height - shadowSize, width, shadowSize);
    }

    // Left shadow - show if there's content to the left of viewport
    if (viewport.left > 0) {
      const gradient = this.#ctx.createLinearGradient(0, 0, shadowSize, 0);
      gradient.addColorStop(0, 'rgba(0, 0, 0, ' + shadowOpacity.toString() + ')');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      this.#ctx.fillStyle = gradient;
      this.#ctx.fillRect(0, 0, shadowSize, height);
    }

    // Right shadow - show if there's content to the right of viewport
    if (viewport.right < worldSize.gridWidth) {
      const gradient = this.#ctx.createLinearGradient(width - shadowSize, 0, width, 0);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, ' + shadowOpacity.toString() + ')');
      this.#ctx.fillStyle = gradient;
      this.#ctx.fillRect(width - shadowSize, 0, shadowSize, height);
    }

    // Corner shadows for enhanced depth perception
    const cornerSize = shadowSize;

    // Top-left corner
    if (viewport.top > 0 && viewport.left > 0) {
      const gradient = this.#ctx.createRadialGradient(0, 0, 0, 0, 0, cornerSize);
      gradient.addColorStop(0, 'rgba(0, 0, 0, ' + (shadowOpacity * 0.7).toString() + ')');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      this.#ctx.fillStyle = gradient;
      this.#ctx.fillRect(0, 0, cornerSize, cornerSize);
    }

    // Top-right corner
    if (viewport.top > 0 && viewport.right < worldSize.gridWidth) {
      const gradient = this.#ctx.createRadialGradient(width, 0, 0, width, 0, cornerSize);
      gradient.addColorStop(0, 'rgba(0, 0, 0, ' + (shadowOpacity * 0.7).toString() + ')');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      this.#ctx.fillStyle = gradient;
      this.#ctx.fillRect(width - cornerSize, 0, cornerSize, cornerSize);
    }

    // Bottom-left corner
    if (viewport.bottom < worldSize.gridHeight && viewport.left > 0) {
      const gradient = this.#ctx.createRadialGradient(0, height, 0, 0, height, cornerSize);
      gradient.addColorStop(0, 'rgba(0, 0, 0, ' + (shadowOpacity * 0.7).toString() + ')');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      this.#ctx.fillStyle = gradient;
      this.#ctx.fillRect(0, height - cornerSize, cornerSize, cornerSize);
    }

    // Bottom-right corner
    if (viewport.bottom < worldSize.gridHeight && viewport.right < worldSize.gridWidth) {
      const gradient = this.#ctx.createRadialGradient(width, height, 0, width, height, cornerSize);
      gradient.addColorStop(0, 'rgba(0, 0, 0, ' + (shadowOpacity * 0.7).toString() + ')');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      this.#ctx.fillStyle = gradient;
      this.#ctx.fillRect(width - cornerSize, height - cornerSize, cornerSize, cornerSize);
    }

    this.#ctx.restore();
  }

    private drawBackgroundPattern(): void {
    if (!this.#ctx) return;

    const canvas = this.canvas().nativeElement;
    const { width, height } = canvas;
    const gridSize = this.#gameState.gridSize();
    const camera = this.#gameState.camera();
    const viewport = this.#gameState.viewport();

    // Create alternating tile pattern for visual movement feedback
    this.#ctx.save();

    // Calculate camera offset for smooth positioning
    const cameraOffsetX = (camera.x - Math.floor(camera.x)) * gridSize;
    const cameraOffsetY = (camera.y - Math.floor(camera.y)) * gridSize;

    for (let x = viewport.left; x < viewport.right; x++) {
      for (let y = viewport.top; y < viewport.bottom; y++) {
        // Calculate screen position with smooth camera offset
        const screenX = (x - Math.floor(camera.x)) * gridSize - cameraOffsetX;
        const screenY = (y - Math.floor(camera.y)) * gridSize - cameraOffsetY;

        // Only draw tiles that are actually visible on screen
        if (screenX < width && screenY < height && screenX > -gridSize && screenY > -gridSize) {
          // Create checkerboard pattern with subtle color variation
          const isEvenTile = (x + y) % 2 === 0;

          this.#ctx.fillStyle = isEvenTile ? "#059670" : "#008236";

          this.#ctx.fillRect(screenX, screenY, gridSize, gridSize);
        }
      }
    }

    this.#ctx.restore();
  }

    private drawWorldDecorations(): void {
    if (!this.#ctx) return;

    const canvas = this.canvas().nativeElement;
    const { width, height } = canvas;
    const gridSize = this.#gameState.gridSize();
    const camera = this.#gameState.camera();
    const viewport = this.#gameState.viewport();

    this.#ctx.save();

    // Calculate camera offset for smooth positioning
    const cameraOffsetX = (camera.x - Math.floor(camera.x)) * gridSize;
    const cameraOffsetY = (camera.y - Math.floor(camera.y)) * gridSize;

    // Generate decorative elements based on world coordinates
    // This ensures decorations stay in the same place as world scrolls
    for (let x = viewport.left; x < viewport.right; x++) {
      for (let y = viewport.top; y < viewport.bottom; y++) {
        // Use deterministic pseudo-random based on coordinates
        const seed = x * 1000 + y;
        const random = this.pseudoRandom(seed);

        // Sparse decoration - only ~8% of tiles have decorations
        if (random < 0.08) {
          // Calculate screen position with smooth camera offset
          const screenX = (x - Math.floor(camera.x)) * gridSize - cameraOffsetX;
          const screenY = (y - Math.floor(camera.y)) * gridSize - cameraOffsetY;

          // Only draw decorations that are actually visible on screen
          if (screenX < width + gridSize && screenY < height + gridSize &&
              screenX > -gridSize && screenY > -gridSize) {
            // Determine decoration type based on seed
            const decorationType = Math.floor(this.pseudoRandom(seed + 1) * 5);

            this.drawDecoration(screenX, screenY, gridSize, decorationType);
          }
        }
      }
    }

    this.#ctx.restore();
  }

  private drawDecoration(x: number, y: number, gridSize: number, type: number): void {
    if (!this.#ctx) return;

    const centerX = x + gridSize / 2;
    const centerY = y + gridSize / 2;
    const size = gridSize * 0.3;

    switch (type) {
      case 0: {
        // Small rock
        this.#ctx.fillStyle = "#6B7280";
        this.#ctx.beginPath();
        this.#ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
        this.#ctx.fill();
        break;
      }

      case 1: {
        // Flower
        this.#ctx.fillStyle = "#F59E0B";
        this.#ctx.beginPath();
        this.#ctx.arc(centerX, centerY, size / 3, 0, Math.PI * 2);
        this.#ctx.fill();
        // Petals
        this.#ctx.fillStyle = "#EC4899";
        for (let index = 0; index < 4; index++) {
          const angle = (index * Math.PI) / 2;
          const petalX = centerX + Math.cos(angle) * size / 2;
          const petalY = centerY + Math.sin(angle) * size / 2;
          this.#ctx.beginPath();
          this.#ctx.arc(petalX, petalY, size / 4, 0, Math.PI * 2);
          this.#ctx.fill();
        }
        break;
      }

      case 2: {
        // Small plant
        this.#ctx.fillStyle = "#22C55E";
        this.#ctx.fillRect(centerX - size / 6, centerY - size / 2, size / 3, size);
        // Leaves
        this.#ctx.beginPath();
        this.#ctx.arc(centerX - size / 3, centerY - size / 4, size / 4, 0, Math.PI * 2);
        this.#ctx.arc(centerX + size / 3, centerY - size / 4, size / 4, 0, Math.PI * 2);
        this.#ctx.fill();
        break;
      }

      case 3: {
        // Mushroom
        this.#ctx.fillStyle = "#EF4444";
        this.#ctx.beginPath();
        this.#ctx.arc(centerX, centerY - size / 4, size / 2, 0, Math.PI);
        this.#ctx.fill();
        // Stem
        this.#ctx.fillStyle = "#F3F4F6";
        this.#ctx.fillRect(centerX - size / 6, centerY - size / 4, size / 3, size / 2);
        break;
      }

      case 4: {
        // Tiny bush
        this.#ctx.fillStyle = "#16A34A";
        this.#ctx.beginPath();
        this.#ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
        this.#ctx.fill();
        // Darker outline
        this.#ctx.strokeStyle = "#15803D";
        this.#ctx.lineWidth = 1;
        this.#ctx.stroke();
        break;
      }
    }
  }

  // Simple pseudo-random function for consistent decoration placement
  private pseudoRandom(seed: number): number {
    const x = Math.sin(seed) * 10_000;
    return x - Math.floor(x);
  }

    private drawFoodDirectionIndicator(): void {
    if (!this.#ctx) return;

    const food = this.#gameState.food();
    const snake = this.#gameState.snake();
    const camera = this.#gameState.camera();
    const canvasSize = this.#gameState.canvasSize();

    if (food.length === 0 || snake.length === 0) return;

    const canvas = this.canvas().nativeElement;
    const { width, height } = canvas;

    // Find the nearest food item
    const snakeHead = snake[0];
    let nearestFood = food[0];
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const foodItem of food) {
      const distance = Math.hypot(foodItem.x - snakeHead.x, foodItem.y - snakeHead.y);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestFood = foodItem;
      }
    }

    // Check if food is visible in current camera view (with slight margin)
    const visibilityMargin = 1; // Grid units
    const isFoodVisible =
      nearestFood.x >= camera.x - visibilityMargin &&
      nearestFood.x < camera.x + canvasSize.gridWidth + visibilityMargin &&
      nearestFood.y >= camera.y - visibilityMargin &&
      nearestFood.y < camera.y + canvasSize.gridHeight + visibilityMargin;

    // Only show indicator if food is off-screen
    if (isFoodVisible) return;

    // Calculate direction from snake head to food
    const deltaX = nearestFood.x - snakeHead.x;
    const deltaY = nearestFood.y - snakeHead.y;
    const angle = Math.atan2(deltaY, deltaX);

    // Calculate indicator position near screen edge
    const margin = 30; // Distance from screen edge
    const indicatorRadius = 15; // Size of the indicator

    // Find where the direction line intersects screen boundary
    let indicatorX: number;
    let indicatorY: number;

    // Calculate intersection with screen bounds
    const centerX = width / 2;
    const centerY = height / 2;

    // Use parametric line equation to find screen edge intersection
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // Calculate distances to each edge
    const distanceToRightEdge = cos > 0 ? (width - margin - centerX) / cos : Number.POSITIVE_INFINITY;
    const distanceToLeftEdge = cos < 0 ? (margin - centerX) / cos : Number.POSITIVE_INFINITY;
    const distanceToBottomEdge = sin > 0 ? (height - margin - centerY) / sin : Number.POSITIVE_INFINITY;
    const distanceToTopEdge = sin < 0 ? (margin - centerY) / sin : Number.POSITIVE_INFINITY;

    // Find the minimum positive distance (closest edge intersection)
    const minimumDistance = Math.min(distanceToRightEdge, distanceToLeftEdge, distanceToBottomEdge, distanceToTopEdge);

    indicatorX = centerX + cos * minimumDistance;
    indicatorY = centerY + sin * minimumDistance;

    // Clamp to screen bounds with margin
    indicatorX = Math.max(margin, Math.min(width - margin, indicatorX));
    indicatorY = Math.max(margin, Math.min(height - margin, indicatorY));

    // Draw the directional indicator
    this.#ctx.save();

    // Draw background circle
    this.#ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.#ctx.beginPath();
    this.#ctx.arc(indicatorX, indicatorY, indicatorRadius + 2, 0, Math.PI * 2);
    this.#ctx.fill();

    // Draw indicator circle
    const foodColor = nearestFood.type === 'golden' ? '#F59E0B' : '#EF4444';
    this.#ctx.fillStyle = foodColor;
    this.#ctx.beginPath();
    this.#ctx.arc(indicatorX, indicatorY, indicatorRadius, 0, Math.PI * 2);
    this.#ctx.fill();

    // Draw directional arrow
    this.#ctx.fillStyle = 'white';
    this.#ctx.translate(indicatorX, indicatorY);
    this.#ctx.rotate(angle);

    // Arrow shape
    const arrowSize = indicatorRadius * 0.6;
    this.#ctx.beginPath();
    this.#ctx.moveTo(arrowSize, 0);
    this.#ctx.lineTo(-arrowSize / 2, -arrowSize / 2);
    this.#ctx.lineTo(-arrowSize / 2, arrowSize / 2);
    this.#ctx.closePath();
    this.#ctx.fill();

    // Draw distance text (optional - shows how far away food is)
    this.#ctx.restore();
    this.#ctx.save();

    // Add subtle distance indicator for very far food
    if (nearestDistance > 20) {
      this.#ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      this.#ctx.font = '10px Arial';
      this.#ctx.textAlign = 'center';
      this.#ctx.fillText(
        Math.floor(nearestDistance).toString(),
        indicatorX,
        indicatorY - indicatorRadius - 8
      );
    }

    this.#ctx.restore();
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
