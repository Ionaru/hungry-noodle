import { GameState } from "../services/game-state";

import { drawRoundedRect } from "./shapes";

export const drawSnake = (
  context: CanvasRenderingContext2D,
  gameState: GameState,
) => {
  const snake = gameState.snake;
  const gridSize = gameState.gridSize();
  const camera = gameState.camera();
  const viewport = gameState.viewport();

  // Optimize by batching rectangle draws
  context.save();

  // Draw snake body first (batch all body segments that are visible)
  if (snake.length() > 1) {
    for (let index = 1; index < snake.length(); index++) {
      context.fillStyle = index % 2 === 0 ? "#374151" : "#4c596f";
      const segment = snake.segments()[index];

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

        context.fillRect(screenX, screenY, gridSize - 2, gridSize - 2);
      }
    }
  }

  // Draw head separately with different color and rounding for better mobile look
  if (snake.length() > 0) {
    const head = snake.segments()[0];
    context.fillStyle = "#1F2937";

    // Convert smooth world coordinates to screen coordinates
    const screenX = (head.x - camera.x) * gridSize + 1;
    const screenY = (head.y - camera.y) * gridSize + 1;
    const size = gridSize - 2;
    const radius = Math.min(4, size / 4);

    drawRoundedRect(context, screenX, screenY, size, size, radius);
    context.fill();
  }

  context.restore();
};
