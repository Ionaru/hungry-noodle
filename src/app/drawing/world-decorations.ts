import { GameState } from "../services/game-state";
import { pseudoRandom } from "../utils/random";

import { drawDecoration } from "./decorations";

export const drawWorldDecorations = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  gameState: GameState,
) => {
  const gridSize = gameState.gridSize();
  const camera = gameState.camera();
  const viewport = gameState.viewport();

  context.save();

  // Calculate camera offset for smooth positioning
  const cameraOffsetX = (camera.x - Math.floor(camera.x)) * gridSize;
  const cameraOffsetY = (camera.y - Math.floor(camera.y)) * gridSize;

  // Generate decorative elements based on world coordinates
  // This ensures decorations stay in the same place as world scrolls
  for (let x = viewport.left; x < viewport.right; x++) {
    for (let y = viewport.top; y < viewport.bottom; y++) {
      // Use deterministic pseudo-random based on coordinates
      const seed = x * 1000 + y;
      const random = pseudoRandom(seed);

      // Sparse decoration - only ~8% of tiles have decorations
      if (random < 0.08) {
        // Calculate screen position with smooth camera offset
        const screenX = (x - Math.floor(camera.x)) * gridSize - cameraOffsetX;
        const screenY = (y - Math.floor(camera.y)) * gridSize - cameraOffsetY;

        // Only draw decorations that are actually visible on screen
        if (
          screenX < width + gridSize &&
          screenY < height + gridSize &&
          screenX > -gridSize &&
          screenY > -gridSize
        ) {
          // Determine decoration type based on seed
          const decorationType = Math.floor(pseudoRandom(seed + 1) * 5);

          drawDecoration(context, screenX, screenY, gridSize, decorationType);
        }
      }
    }
  }

  context.restore();
};
