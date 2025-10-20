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

  // Create alternating tile pattern for visual movement feedback
  context.save();

  // Calculate camera offset for smooth positioning
  const cameraOffsetX = (camera.x - Math.floor(camera.x)) * gridSize;
  const cameraOffsetY = (camera.y - Math.floor(camera.y)) * gridSize;

  // Fill the entire canvas with the background color first to prevent gaps
  context.fillStyle = "#059670";
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
        // Create checkerboard pattern with subtle color variation
        const isEvenTile = (x + y) % 2 === 0;

        context.fillStyle = isEvenTile ? "#059670" : "#008236";

        context.fillRect(screenX, screenY, gridSize, gridSize);
      }
    }
  }

  context.restore();
};
