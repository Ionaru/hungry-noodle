import { Color, MapTheme } from "../map/types";
import { GameState } from "../services/game-state";
import { SnakeSegment } from "../snake/types";

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
        context.fillStyle = getTileColor(x, y, snake, theme);
        context.fillRect(screenX, screenY, gridSize, gridSize);
      }
    }
  }

  context.restore();
};
const getTileColor = (
  x: number,
  y: number,
  snake: SnakeSegment[],
  theme: MapTheme,
): Color => {
  // Color occupied tiles a single color
  if (snake.length > 0) {
    for (let index = 1; index < snake.length - 1; index++) {
      const segment = snake[index];
      const segmentX = Math.floor(segment.x);
      const segmentXNext = Math.ceil(segment.x);
      const segmentY = Math.floor(segment.y);
      const segmentYNext = Math.ceil(segment.y);

      if (
        (segmentX === x && segmentY === y) ||
        (segmentXNext === x && segmentYNext === y)
      ) {
        return theme.background;
      }
    }
  }

  // Otherwise, create checkerboard pattern with subtle color variation
  const isEvenTile = (x + y) % 2 === 0;
  return isEvenTile ? theme.background : theme.backgroundAlt;
};
