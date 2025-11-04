import { Color, MapTheme } from "../map/types";
import { GameState } from "../services/game-state";

export const drawBackgroundPattern = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  gameState: GameState,
) => {
  const gridSize = gameState.gridSize();
  const camera = gameState.camera();
  const viewport = gameState.viewport();
  const theme = gameState.mapTheme();
  const snake = gameState.snake();

  // Create alternating tile pattern for visual movement feedback
  context.save();

  // Calculate camera offset for smooth positioning
  const cameraOffsetX = (camera.x - Math.floor(camera.x)) * gridSize;
  const cameraOffsetY = (camera.y - Math.floor(camera.y)) * gridSize;

  // Fill the entire canvas with the background color first to prevent gaps
  context.fillStyle = theme.background;
  context.fillRect(0, 0, width, height);

  // Color the tiles under the snake body (all segments except the head and tail).
  const occupiedTiles = new Set<`${string},${string}`>();
  if (snake.length > 2) {
    for (let index = 1; index < snake.length - 1; index++) {
      const segment = snake[index];
      const segmentX = Math.floor(segment.x);
      const segmentY = Math.floor(segment.y);
      occupiedTiles.add(`${segmentX.toString()},${segmentY.toString()}`);
      const segmentXNext = Math.ceil(segment.x);
      const segmentYNext = Math.ceil(segment.y);
      occupiedTiles.add(
        `${segmentXNext.toString()},${segmentYNext.toString()}`,
      );
    }
  }

  // Then draw the checkerboard pattern over it
  for (let x = viewport.left; x < viewport.right; x++) {
    for (let y = viewport.top; y < viewport.bottom; y++) {
      // Calculate screen position with smooth camera offset
      const screenX = (x - Math.floor(camera.x)) * gridSize - cameraOffsetX;
      const screenY = (y - Math.floor(camera.y)) * gridSize - cameraOffsetY;

      // Only draw tiles that are actually visible on screen
      if (
        screenX < width &&
        screenY < height &&
        screenX > -gridSize &&
        screenY > -gridSize
      ) {
        context.fillStyle = getTileColor(x, y, occupiedTiles, theme);
        context.fillRect(screenX, screenY, gridSize, gridSize);
      }
    }
  }

  context.restore();
};
const getTileColor = (
  x: number,
  y: number,
  occupiedTiles: Set<`${string},${string}`>,
  theme: MapTheme,
): Color => {
  // Color snake-occupied tiles a single color
  if (occupiedTiles.has(`${x.toString()},${y.toString()}`)) {
    return theme.background;
  }

  // Otherwise, create checkerboard pattern with subtle color variation
  const isEvenTile = (x + y) % 2 === 0;
  return isEvenTile ? theme.background : theme.backgroundAlt;
};
