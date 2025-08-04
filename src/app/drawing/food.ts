import { GameState } from "../services/game-state";

import { drawRoundedRect } from "./shapes";

export const drawFood = (
  context: CanvasRenderingContext2D,
  gameState: GameState,
) => {
  const food = gameState.food();
  const gridSize = gameState.gridSize();
  const camera = gameState.camera();
  const viewport = gameState.viewport();

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
        context.save();
        context.shadowColor = "#F59E0B";
        context.shadowBlur = 8;
        context.fillStyle = "#F59E0B";
        drawRoundedRect(context, screenX, screenY, size, size, size / 3);
        context.fill();
        context.restore();
      } else {
        // Regular food
        context.fillStyle = "#EF4444";
        drawRoundedRect(context, screenX, screenY, size, size, size / 4);
        context.fill();
      }
    }
  }
};
