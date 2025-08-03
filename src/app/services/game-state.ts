import { Injectable, signal, computed } from "@angular/core";

export interface SnakeSegment {
  x: number; // Floating point position for smooth movement
  y: number; // Floating point position for smooth movement
}

export interface Food {
  x: number;
  y: number;
  type: "normal" | "golden" | "special";
  value: number;
}

export interface Camera {
  x: number;
  y: number;
}

export type GameStatus = "menu" | "playing" | "paused" | "gameOver";
export type Direction = "up" | "down" | "left" | "right";

@Injectable({
  providedIn: "root",
})
export class GameState {
  // Core game state signals
  readonly score = signal(0);
  readonly snake = signal<SnakeSegment[]>([]);
  readonly food = signal<Food[]>([]);
  readonly gameStatus = signal<GameStatus>("menu");
  readonly direction = signal<Direction>("right");
  readonly gameTime = signal(0);

  // Canvas and game settings - responsive for mobile
  readonly canvasWidth = signal(320); // Will be updated dynamically
  readonly canvasHeight = signal(480); // Will be updated dynamically
  readonly gridSize = signal(16); // Smaller grid for mobile

  // World size - much larger than screen
  readonly worldWidth = signal(80); // World width in grid units (80 * 16 = 1280px)
  readonly worldHeight = signal(120); // World height in grid units (120 * 16 = 1920px)

  // Camera/viewport system
  readonly camera = signal<Camera>({ x: 0, y: 0 }); // Current camera position in grid units
  #targetCamera: Camera = { x: 0, y: 0 }; // Target camera position for smooth following
  #cameraSmoothingFactor = 0.01; // Adjustable smoothing (0.1 = very smooth, 0.3 = responsive)

  // Smooth continuous movement
  readonly movementSpeed = signal(4); // Grid units per second
  #pendingDirection: Direction | null = null; // Direction to change to at next grid position

  // Event signals for UI updates
  readonly foodEatenEvent = signal<Food | null>(null); // Emits when food is eaten

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

  // Computed world and viewport properties
  readonly worldSize = computed(() => ({
    width: this.worldWidth() * this.gridSize(),
    height: this.worldHeight() * this.gridSize(),
    gridWidth: this.worldWidth(),
    gridHeight: this.worldHeight(),
  }));

  readonly viewport = computed(() => {
    const canvasSize = this.canvasSize();
    const camera = this.camera();
    const worldSize = this.worldSize();

    // Calculate integer grid bounds for rendering (expand by 1 to prevent flickering)
    const left = Math.max(0, Math.floor(camera.x) - 1);
    const top = Math.max(0, Math.floor(camera.y) - 1);
    const right = Math.min(
      worldSize.gridWidth,
      Math.ceil(camera.x + canvasSize.gridWidth) + 1,
    );
    const bottom = Math.min(
      worldSize.gridHeight,
      Math.ceil(camera.y + canvasSize.gridHeight) + 1,
    );

    return {
      // Viewport bounds in grid units (integer bounds for stable rendering)
      left,
      top,
      right,
      bottom,
      // Viewport size
      width: right - left,
      height: bottom - top,
    };
  });

  // Mobile-responsive canvas sizing
  updateCanvasSize(containerWidth: number, containerHeight: number): void {
    // Leave space for HUD and controls (about 120px total)
    const availableHeight = containerHeight - 120;
    const availableWidth = containerWidth - 32; // 16px padding on each side

    // For mobile (portrait), prioritize height and keep aspect ratio suitable for snake
    const aspectRatio = 0.75; // 3:4 ratio works well for portrait snake game

    let newWidth = availableWidth;
    let newHeight = availableWidth / aspectRatio;

    // If height exceeds available space, scale down
    if (newHeight > availableHeight) {
      newHeight = availableHeight;
      newWidth = newHeight * aspectRatio;
    }

    // Ensure minimum playable size
    const minWidth = 280;
    const minHeight = 360;

    newWidth = Math.max(newWidth, minWidth);
    newHeight = Math.max(newHeight, minHeight);

    // Round to multiples of grid size for clean rendering
    const gridSize = this.gridSize();
    newWidth = Math.floor(newWidth / gridSize) * gridSize;
    newHeight = Math.floor(newHeight / gridSize) * gridSize;

    this.canvasWidth.set(newWidth);
    this.canvasHeight.set(newHeight);
  }

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
    // This will be handled by the game canvas component
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

    if (opposites[current] !== newDirection && newDirection !== current) {
      // Set pending direction to change at next grid position
      this.#pendingDirection = newDirection;
    }
  }

  updateScore(points: number): void {
    this.score.update((current) => current + points);
  }

  // Continuous movement system
  updateMovement(deltaTime: number): void {
    if (this.gameStatus() !== "playing") return;

    // Move snake smoothly
    this.moveSnakeContinuous(deltaTime);

    // Update target camera position based on snake head
    this.updateTargetCamera();

    // Smoothly move camera towards target
    this.updateCameraSmooth(deltaTime);
  }

  private moveSnakeContinuous(deltaTime: number): void {
    const snake = this.snake();
    if (snake.length === 0) return;

    const currentDirection = this.direction();
    const speed = this.movementSpeed();
    const distance = (speed * deltaTime) / 1000; // Convert to grid units per frame

    // Calculate movement delta based on current direction
    let deltaX = 0;
    let deltaY = 0;

    switch (currentDirection) {
      case "up": {
        deltaY = -distance;
        break;
      }
      case "down": {
        deltaY = distance;
        break;
      }
      case "left": {
        deltaX = -distance;
        break;
      }
      case "right": {
        deltaX = distance;
        break;
      }
    }

    const head = snake[0];
    const newHeadX = head.x + deltaX;
    const newHeadY = head.y + deltaY;

    // Check boundary collision before moving
    const { gridWidth, gridHeight } = this.worldSize();
    if (
      newHeadX < 0 ||
      newHeadX >= gridWidth ||
      newHeadY < 0 ||
      newHeadY >= gridHeight
    ) {
      this.endGame();
      return;
    }

    // Check if head has reached a grid position and handle direction change
    const headGridX = Math.round(newHeadX);
    const headGridY = Math.round(newHeadY);

    // If head is very close to a grid position and we have a pending direction change
    if (
      this.#pendingDirection &&
      Math.abs(newHeadX - headGridX) < 0.1 &&
      Math.abs(newHeadY - headGridY) < 0.1
    ) {
      // Change direction at grid position
      this.direction.set(this.#pendingDirection);
      this.#pendingDirection = null;

      // Snap head to exact grid position for clean turns
      const newSnake = [...snake];
      newSnake[0] = { x: headGridX, y: headGridY };

      // Check for food consumption at this grid position
      const shouldGrow = this.checkFoodConsumption(headGridX, headGridY);

      // Grow snake if food was consumed
      if (shouldGrow) {
        this.growSnakeInArray(newSnake);
      }

      // Update body segments with proper spacing
      this.updateBodySegments(newSnake, deltaTime);

      this.snake.set(newSnake);
      return;
    }

    // Normal continuous movement
    const newSnake = [...snake];
    newSnake[0] = { x: newHeadX, y: newHeadY };

    // Check for food consumption during continuous movement
    const shouldGrow = this.checkFoodConsumption(newHeadX, newHeadY);

    // Grow snake if food was consumed
    if (shouldGrow) {
      this.growSnakeInArray(newSnake);
    }

    // Check self-collision
    if (this.checkSelfCollision(newHeadX, newHeadY, newSnake)) {
      this.endGame();
      return;
    }

    // Update body segments with proper spacing
    this.updateBodySegments(newSnake, deltaTime);

    this.snake.set(newSnake);
  }

  // Update target camera position based on snake head
  private updateTargetCamera(): void {
    const snake = this.snake();
    if (snake.length === 0) return;

    const head = snake[0];
    const canvasSize = this.canvasSize();
    const worldSize = this.worldSize();

    // Calculate desired camera position to center snake head
    const centerX = head.x - canvasSize.gridWidth / 2;
    const centerY = head.y - canvasSize.gridHeight / 2;

    // Clamp camera position to world boundaries
    const clampedX = Math.max(
      0,
      Math.min(centerX, worldSize.gridWidth - canvasSize.gridWidth),
    );
    const clampedY = Math.max(
      0,
      Math.min(centerY, worldSize.gridHeight - canvasSize.gridHeight),
    );

    this.#targetCamera = { x: clampedX, y: clampedY };
  }

  // Update body segments with proper spacing to prevent compression
  private updateBodySegments(
    newSnake: SnakeSegment[],
    deltaTime: number,
  ): void {
    const segmentDistance = 1; // Distance between segments in grid units
    const speed = this.movementSpeed();
    const moveDistance = (speed * deltaTime) / 1000;

    // Update each body segment to follow the one in front with proper spacing
    for (let index = 1; index < newSnake.length; index++) {
      const current = newSnake[index];
      const target = newSnake[index - 1];

      // Calculate direction from current to target
      const dx = target.x - current.x;
      const dy = target.y - current.y;
      const currentDistance = Math.hypot(dx, dy);

      // Only move if we're too far from target (with small tolerance to prevent jitter)
      if (currentDistance > segmentDistance + 0.01) {
        // Calculate how much to move (don't overshoot)
        const excessDistance = currentDistance - segmentDistance;
        const actualMoveDistance = Math.min(moveDistance, excessDistance);

        // Move towards target
        if (currentDistance > 0) {
          const moveRatio = actualMoveDistance / currentDistance;
          current.x += dx * moveRatio;
          current.y += dy * moveRatio;
        }
      }
    }
  }

  // Check for food consumption with continuous positions
  private checkFoodConsumption(headX: number, headY: number): boolean {
    const food = this.food();
    const consumptionRadius = 0.4; // Allow some tolerance for continuous movement

    for (let foodIndex = 0; foodIndex < food.length; foodIndex++) {
      const foodItem = food[foodIndex];
      const distance = Math.hypot(headX - foodItem.x, headY - foodItem.y);

      if (distance <= consumptionRadius) {
        // Remove only the eaten food item
        const newFood = food.filter((_, index) => index !== foodIndex);
        this.food.set(newFood);

        // Update score
        this.updateScore(foodItem.value);
        this.spawnFood();
        this.foodEatenEvent.set(foodItem); // Emit event for UI updates
        return true; // Indicate that food was consumed
      }
    }
    return false; // No food was consumed
  }

  // Check self-collision with continuous positions
  private checkSelfCollision(
    headX: number,
    headY: number,
    snake: SnakeSegment[],
  ): boolean {
    const collisionRadius = 0.4; // Collision radius for head-to-body collision

    // Only check collision if snake is long enough (need at least 4 segments to potentially collide)
    if (snake.length < 4) return false;

    // Check collision with body segments (skip head at index 0 and next 2 segments to allow sharp turns)
    for (let index = 3; index < snake.length; index++) {
      const segment = snake[index];
      const distance = Math.hypot(headX - segment.x, headY - segment.y);

      if (distance < collisionRadius) {
        return true;
      }
    }

    return false;
  }

  // Grow snake by adding a segment to the provided array
  private growSnakeInArray(snakeArray: SnakeSegment[]): void {
    if (snakeArray.length === 0) return;

    const tail = snakeArray.at(-1);
    if (!tail) return;

    // For continuous movement, simply duplicate the tail position
    // The updateBodySegments method will properly position it
    const newSegment = { x: tail.x, y: tail.y };

    // Add the new segment at the tail
    snakeArray.push(newSegment);

    // Debug logging to verify growth
    console.log(
      `Snake grew from ${(snakeArray.length - 1).toString()} to ${snakeArray.length.toString()} segments`,
    );
  }

  // Legacy grow snake method for backward compatibility
  private growSnake(): void {
    const snake = [...this.snake()];
    this.growSnakeInArray(snake);
    this.snake.set(snake);
  }

  // Smoothly interpolate camera towards target position
  private updateCameraSmooth(deltaTime: number): void {
    const currentCamera = this.camera();
    const targetCamera = this.#targetCamera;

    // Frame-rate independent interpolation using exponential smoothing
    const frameRate = 1000 / Math.max(deltaTime, 1); // Prevent division by zero
    const targetFrameRate = 60;
    const adjustedSmoothing =
      1 -
      Math.pow(1 - this.#cameraSmoothingFactor, targetFrameRate / frameRate);

    // Interpolate camera position
    const newX =
      currentCamera.x + (targetCamera.x - currentCamera.x) * adjustedSmoothing;
    const newY =
      currentCamera.y + (targetCamera.y - currentCamera.y) * adjustedSmoothing;

    this.camera.set({ x: newX, y: newY });
  }

  // Method to adjust camera smoothness (for fine-tuning)
  setCameraSmoothness(factor: number): void {
    // Clamp between 0.05 (very smooth) and 0.5 (very responsive)
    this.#cameraSmoothingFactor = Math.max(0.05, Math.min(0.5, factor));
  }

  // Legacy camera method for initial setup - immediately positions camera
  updateCamera(): void {
    const snake = this.snake();
    if (snake.length === 0) return;

    const head = snake[0];
    const canvasSize = this.canvasSize();
    const worldSize = this.worldSize();

    // Calculate desired camera position to center snake head
    const centerX = head.x - Math.floor(canvasSize.gridWidth / 2);
    const centerY = head.y - Math.floor(canvasSize.gridHeight / 2);

    // Clamp camera position to world boundaries
    const clampedX = Math.max(
      0,
      Math.min(centerX, worldSize.gridWidth - canvasSize.gridWidth),
    );
    const clampedY = Math.max(
      0,
      Math.min(centerY, worldSize.gridHeight - canvasSize.gridHeight),
    );

    // For immediate positioning (initialization), set both current and target
    this.camera.set({ x: clampedX, y: clampedY });
    this.#targetCamera = { x: clampedX, y: clampedY };
  }

  // Private initialization methods
  private initializeGame(): void {
    const centerX = Math.floor(this.worldSize().gridWidth / 2);
    const centerY = Math.floor(this.worldSize().gridHeight / 2);

    // Initialize snake in center of world
    const initialSnake = [
      { x: centerX, y: centerY },
      { x: centerX - 1, y: centerY },
      { x: centerX - 2, y: centerY },
    ];

    this.snake.set(initialSnake);

    // Reset pending direction
    this.#pendingDirection = null;

    this.direction.set("right");
    this.updateCamera(); // Center camera on snake
    this.spawnFood();
  }

  spawnFood(): void {
    const gridWidth = this.worldSize().gridWidth;
    const gridHeight = this.worldSize().gridHeight;
    const snake = this.snake();

    let foodPosition: { x: number; y: number };

    // Find empty position for food in the world
    do {
      foodPosition = {
        // eslint-disable-next-line sonarjs/pseudo-random
        x: Math.floor(Math.random() * gridWidth),
        // eslint-disable-next-line sonarjs/pseudo-random
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
      // eslint-disable-next-line sonarjs/pseudo-random
      type: Math.random() < 0.1 ? "golden" : "normal",
      // eslint-disable-next-line sonarjs/pseudo-random
      value: Math.random() < 0.1 ? 5 : 1,
    };

    this.food.set([food]);
  }
}
