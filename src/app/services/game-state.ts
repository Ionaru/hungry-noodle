import { Injectable, signal, computed, inject, effect } from "@angular/core";

import { MapState } from "../map/state";
import { TerrainType, type MapConfig } from "../map/types";

import { Progression } from "./progression";
import { SavedGame } from "./storage/data";
import { Store } from "./store";

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

interface SpeedConfig {
  normalMultiplier: number;
  turboMultiplier: number;
  slowMultiplier: number;
  postTurboSlowDurationMs: number;
}

@Injectable({
  providedIn: "root",
})
export class GameState {
  readonly progression = inject(Progression);
  readonly store = inject(Store);
  readonly #map = inject(MapState);

  // Core game state signals
  readonly score = signal(0);
  readonly snake = signal<SnakeSegment[]>([]);
  readonly food = signal<Food[]>([]);
  readonly gameStatus = signal<GameStatus>("playing");
  readonly direction = signal<Direction | null>(null);
  readonly gameTime = signal(0);

  // Canvas and game settings - responsive for mobile
  readonly canvasWidth = signal(320); // Will be updated dynamically
  readonly canvasHeight = signal(480); // Will be updated dynamically
  readonly gridSize = signal(16); // Smaller grid for mobile

  // World size - synced from MapState
  readonly worldWidth = signal(80); // grid units
  readonly worldHeight = signal(120); // grid units

  // Camera/viewport system
  readonly camera = signal<Camera>({ x: 0, y: 0 }); // Current camera position in grid units
  #targetCamera: Camera = { x: 0, y: 0 }; // Target camera position for smooth following
  #cameraSmoothingFactor = 0.05; // Adjustable smoothing (0.1 = very smooth, 0.3 = responsive)

  // Smooth continuous movement
  readonly movementSpeed = signal(4); // Grid units per second
  #pendingDirection: Direction | null = null; // Direction to change to at next grid position

  // Speed/turbo system
  #turboActive = false;
  #postTurboSlowRemainingMs = 0;
  #speedConfig: SpeedConfig = {
    normalMultiplier: 1,
    turboMultiplier: 2,
    slowMultiplier: 0.5,
    postTurboSlowDurationMs: 400,
  };

  // Path tracking for proper body following
  #headPath: SnakeSegment[] = []; // Path of positions the head has traveled

  // Event signals for UI updates
  readonly foodEatenEvent = signal<Food | null>(null); // Emits when food is eaten

  // Game statistics
  readonly currentLength = computed(() => this.snake().length);
  readonly highScore = computed(() => {
    return Math.max(this.progression.playerStats().highScore, this.score());
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

  // Map theme proxy for drawing
  readonly mapTheme = computed(() => this.#map.mapData().theme);

  constructor() {
    // Sync world/grid from current map config
    effect(() => {
      const md = this.#map.mapData();
      // keep grid size aligned with map for rendering/pixel math
      if (this.gridSize() !== md.config.gridSize)
        this.gridSize.set(md.config.gridSize);
      if (this.worldWidth() !== md.config.width)
        this.worldWidth.set(md.config.width);
      if (this.worldHeight() !== md.config.height)
        this.worldHeight.set(md.config.height);
    });
  }

  // Mobile-responsive canvas sizing
  updateCanvasSize(containerWidth: number, containerHeight: number): void {
    let newWidth = containerWidth;
    let newHeight = containerHeight;

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
    // Initialize a default map (temporary until UI supplies config)
    this.#map.init({
      width: 80,
      height: 120,
      gridSize: 16,
      terrainType: TerrainType.GRASSLANDS,
    });
    this.initializeGame();
    this.gameStatus.set("playing");
  }

  // Explicit pause without toggle semantics
  pause(): void {
    if (this.gameStatus() === "playing") {
      this.gameStatus.set("paused");
    }
  }

  // Explicit resume without reinitializing
  resume(): void {
    if (this.gameStatus() !== "gameOver" && this.snake().length > 0) {
      this.gameStatus.set("playing");
    }
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
    this.progression.updateStats({
      currentLength: this.currentLength(),
      currentScore: this.score(),
      playTime: this.gameTime(),
    });
    // Clear saved game when game ends - no continues after game over
    this.store.clearSavedGame();
  }

  resetGame(): void {
    this.score.set(0);
    this.gameTime.set(0);
    this.#headPath = []; // Reset path tracking
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

    if (
      !current ||
      (opposites[current] !== newDirection && newDirection !== current)
    ) {
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

    // Update transient speed state (post-turbo slow window)
    if (!this.#turboActive && this.#postTurboSlowRemainingMs > 0) {
      this.#postTurboSlowRemainingMs = Math.max(
        0,
        this.#postTurboSlowRemainingMs - deltaTime,
      );
    }

    // Move snake smoothly (speed adjusted internally)
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
    const baseSpeed = this.movementSpeed();
    let speedMultiplier = this.#speedConfig.normalMultiplier;
    if (this.#turboActive) {
      speedMultiplier = this.#speedConfig.turboMultiplier;
    } else if (this.#postTurboSlowRemainingMs > 0) {
      speedMultiplier = this.#speedConfig.slowMultiplier;
    }
    const speed = baseSpeed * speedMultiplier;
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

    // Check obstacle collision (rounded to nearest grid cell)
    if (this.isBlocked(Math.round(newHeadX), Math.round(newHeadY))) {
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

      // Check obstacle collision at snapped grid position
      if (this.isBlocked(headGridX, headGridY)) {
        this.endGame();
        return;
      }

      // Record this grid position in the path
      this.recordHeadPosition(headGridX, headGridY);

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

    // Record head position for path tracking
    this.recordHeadPosition(newHeadX, newHeadY);

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

  // Public controls for turbo
  activateTurbo(): void {
    this.#turboActive = true;
    this.#postTurboSlowRemainingMs = 0; // cancel any pending slow
  }

  deactivateTurbo(): void {
    // Enter brief slow window to aid turning
    this.#turboActive = false;
    this.#postTurboSlowRemainingMs = this.#speedConfig.postTurboSlowDurationMs;
  }

  // Optional configuration of multipliers/durations
  configureMovementSpeeds(
    config: Partial<{
      normalMultiplier: number;
      turboMultiplier: number;
      slowMultiplier: number;
      postTurboSlowDurationMs: number;
    }>,
  ): void {
    this.#speedConfig = { ...this.#speedConfig, ...config };
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

  // Record head position in the path for body segments to follow
  private recordHeadPosition(x: number, y: number): void {
    // Add current head position to the front of the path
    this.#headPath.unshift({ x, y });

    // Limit path length to prevent excessive memory usage
    // Keep enough path for the longest possible snake plus some buffer
    const maxPathLength = this.worldWidth() * this.worldHeight() + 100;
    if (this.#headPath.length > maxPathLength) {
      this.#headPath.splice(maxPathLength);
    }
  }

  private updateBodySegments(
    newSnake: SnakeSegment[],
    _deltaTime: number,
  ): void {
    if (newSnake.length < 2 || this.#headPath.length === 0) return;

    const segmentSpacing = 1; // Target distance between segments (1 grid unit)

    // Update each body segment to follow the path at the correct distance
    for (let segmentIndex = 1; segmentIndex < newSnake.length; segmentIndex++) {
      const targetDistance = segmentIndex * segmentSpacing; // Distance from head along path

      // Find the target position along the path at the correct distance
      const targetPosition = this.findPositionAlongPath(targetDistance);
      if (!targetPosition) continue; // Skip if can't find target position

      // Snap the segment exactly to the computed point along the path
      newSnake[segmentIndex] = { x: targetPosition.x, y: targetPosition.y };
    }
  }

  // Find position along the recorded path at a specific distance from the head
  private findPositionAlongPath(targetDistance: number): SnakeSegment | null {
    if (this.#headPath.length === 0) return null;

    let accumulatedDistance = 0;
    let previousPosition = this.#headPath[0];

    // Walk along the path until we reach the target distance
    for (let index = 1; index < this.#headPath.length; index++) {
      const currentPosition = this.#headPath[index];
      const segmentDistance = Math.hypot(
        currentPosition.x - previousPosition.x,
        currentPosition.y - previousPosition.y,
      );

      if (accumulatedDistance + segmentDistance >= targetDistance) {
        // Target distance is within this segment
        const remainingDistance = targetDistance - accumulatedDistance;
        const ratio = remainingDistance / segmentDistance;

        // Interpolate between previous and current position
        return {
          x:
            previousPosition.x +
            (currentPosition.x - previousPosition.x) * ratio,
          y:
            previousPosition.y +
            (currentPosition.y - previousPosition.y) * ratio,
        };
      }

      accumulatedDistance += segmentDistance;
      previousPosition = currentPosition;
    }

    // If we've run out of path, return the last position
    return this.#headPath.at(-1) ?? null;
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
      { x: centerX, y: centerY },
      { x: centerX, y: centerY },
    ];

    this.snake.set(initialSnake);

    // Initialize head path with the initial snake positions
    this.#headPath = [];
    for (let index = initialSnake.length - 1; index >= 0; index--) {
      this.#headPath.push({ ...initialSnake[index] });
    }

    // Reset pending direction
    this.#pendingDirection = null;

    this.updateCamera(); // Center camera on snake
    this.spawnFood();
  }

  spawnFood(): void {
    const gridWidth = this.worldSize().gridWidth;
    const gridHeight = this.worldSize().gridHeight;
    const snake = this.snake();

    let foodPosition: { x: number; y: number };
    const maxAttempts = 100; // Prevent infinite loops
    let attempts = 0;

    // Find good position for food in the world
    do {
      foodPosition = {
        // eslint-disable-next-line sonarjs/pseudo-random
        x: Math.floor(Math.random() * gridWidth),
        // eslint-disable-next-line sonarjs/pseudo-random
        y: Math.floor(Math.random() * gridHeight),
      };
      attempts++;
    } while (
      attempts < maxAttempts &&
      !this.isValidFoodPosition(foodPosition.x, foodPosition.y, snake)
    );

    // If we couldn't find a valid position after many attempts, just place it somewhere safe
    if (attempts >= maxAttempts) {
      do {
        foodPosition = {
          // eslint-disable-next-line sonarjs/pseudo-random
          x: Math.floor(Math.random() * gridWidth),
          // eslint-disable-next-line sonarjs/pseudo-random
          y: Math.floor(Math.random() * gridHeight),
        };
      } while (
        this.isBlocked(foodPosition.x, foodPosition.y) ||
        snake.some(
          (segment) =>
            segment.x === foodPosition.x && segment.y === foodPosition.y,
        )
      );
    }

    // Use cryptographically secure random for golden food chance
    const randomArray = new Uint32Array(1);
    crypto.getRandomValues(randomArray);
    const isGolden = randomArray[0] / 0xff_ff_ff_ff < 0.1;
    const food: Food = {
      x: foodPosition.x,
      y: foodPosition.y,
      type: isGolden ? "golden" : "normal",
      value: isGolden ? 5 : 1,
    };

    this.food.update((current) => [...current, food]);

    // eslint-disable-next-line sonarjs/pseudo-random
    if (Math.random() < 0.1) {
      this.spawnFood();
    }
  }

  private isValidFoodPosition(
    x: number,
    y: number,
    snake: SnakeSegment[],
  ): boolean {
    // Basic checks
    if (this.isBlocked(x, y)) return false;

    // Check if snake is already there
    if (snake.some((segment) => segment.x === x && segment.y === y))
      return false;

    // Check if too close to obstacles (minimum 2 tiles away)

    if (this.#map.isNearObstacle(x, y, 2)) return false;

    // Check if there's enough open space around the position (at least 3x3 area)
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const checkX = x + dx;
        const checkY = y + dy;
        if (this.isBlocked(checkX, checkY)) {
          // If any adjacent tile is blocked, this position is too cramped
          return false;
        }
      }
    }

    // Basic reachability check - ensure there's a path to the food
    // This is a simplified check - we just ensure the food isn't completely surrounded by obstacles
    let openSides = 0;
    const directions = [
      { x: 0, y: -1 }, // up
      { x: 1, y: 0 }, // right
      { x: 0, y: 1 }, // down
      { x: -1, y: 0 }, // left
    ];

    for (const direction of directions) {
      const checkX = x + direction.x;
      const checkY = y + direction.y;
      if (!this.isBlocked(checkX, checkY)) {
        openSides++;
      }
    }

    // Require at least 2 open sides for accessibility
    return openSides >= 2;
  }

  // Save/Load functionality
  toSavedGame(): SavedGame {
    return {
      version: 1,
      score: this.score(),
      snake: this.snake(),
      food: this.food(),
      direction: this.direction(),
      gameTime: this.gameTime(),
      gridSize: this.gridSize(),
      worldWidth: this.worldWidth(),
      worldHeight: this.worldHeight(),
      camera: this.camera(),
      mapTerrainType: this.#map.mapData().config.terrainType,
    };
  }

  loadFromSavedGame(savedGame: SavedGame): void {
    // Backward/forward compatible load
    let cfg: MapConfig | null = null;
    if (savedGame.version === 1) {
      cfg = {
        width: savedGame.worldWidth,
        height: savedGame.worldHeight,
        gridSize: savedGame.gridSize,
        terrainType: TerrainType.GRASSLANDS,
      };
    }

    if (cfg) {
      this.#map.init(cfg);
      this.gridSize.set(cfg.gridSize);
      this.worldWidth.set(cfg.width);
      this.worldHeight.set(cfg.height);
    }

    // Load all the basic state
    this.score.set(savedGame.score);
    this.snake.set([...savedGame.snake]);
    // Convert saved food format to full Food objects
    this.food.set(
      savedGame.food.map((f) => ({
        x: f.x,
        y: f.y,
        value: f.value,
        type: f.value > 1 ? "golden" : ("normal" as const),
      })),
    );
    this.direction.set(savedGame.direction);
    this.gameTime.set(savedGame.gameTime);
    this.camera.set({ ...savedGame.camera });

    // Reset internal state that can't be safely serialized
    this.#pendingDirection = null;
    this.#turboActive = false;
    this.#postTurboSlowRemainingMs = 0;
    this.#headPath = [...savedGame.snake];
    this.#targetCamera = { ...savedGame.camera };
  }

  // Proxy to MapState for obstacle checks
  isBlocked(x: number, y: number): boolean {
    return this.#map.isBlocked(x, y);
  }

  // Public access to map state for other components
  get map(): MapState {
    return this.#map;
  }
}
