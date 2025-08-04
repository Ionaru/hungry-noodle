import { GameState } from "../services/game-state";

export const drawEdgeShadows = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  gameState: GameState,
) => {
  const viewport = gameState.viewport();
  const worldSize = gameState.worldSize();

  // Shadow properties
  const shadowSize = 20; // Shadow depth in pixels
  const shadowOpacity = 0.3; // Shadow opacity

  context.save();

  // Top shadow - show if there's content above viewport
  if (viewport.top > 0) {
    const gradient = context.createLinearGradient(0, 0, 0, shadowSize);
    gradient.addColorStop(0, "rgba(0, 0, 0, " + shadowOpacity.toString() + ")");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, shadowSize);
  }

  // Bottom shadow - show if there's content below viewport
  if (viewport.bottom < worldSize.gridHeight) {
    const gradient = context.createLinearGradient(
      0,
      height - shadowSize,
      0,
      height,
    );
    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, "rgba(0, 0, 0, " + shadowOpacity.toString() + ")");
    context.fillStyle = gradient;
    context.fillRect(0, height - shadowSize, width, shadowSize);
  }

  // Left shadow - show if there's content to the left of viewport
  if (viewport.left > 0) {
    const gradient = context.createLinearGradient(0, 0, shadowSize, 0);
    gradient.addColorStop(0, "rgba(0, 0, 0, " + shadowOpacity.toString() + ")");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, shadowSize, height);
  }

  // Right shadow - show if there's content to the right of viewport
  if (viewport.right < worldSize.gridWidth) {
    const gradient = context.createLinearGradient(
      width - shadowSize,
      0,
      width,
      0,
    );
    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, "rgba(0, 0, 0, " + shadowOpacity.toString() + ")");
    context.fillStyle = gradient;
    context.fillRect(width - shadowSize, 0, shadowSize, height);
  }

  // Corner shadows for enhanced depth perception
  const cornerSize = shadowSize;

  // Top-left corner
  if (viewport.top > 0 && viewport.left > 0) {
    const gradient = context.createRadialGradient(0, 0, 0, 0, 0, cornerSize);
    gradient.addColorStop(
      0,
      "rgba(0, 0, 0, " + (shadowOpacity * 0.7).toString() + ")",
    );
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, cornerSize, cornerSize);
  }

  // Top-right corner
  if (viewport.top > 0 && viewport.right < worldSize.gridWidth) {
    const gradient = context.createRadialGradient(
      width,
      0,
      0,
      width,
      0,
      cornerSize,
    );
    gradient.addColorStop(
      0,
      "rgba(0, 0, 0, " + (shadowOpacity * 0.7).toString() + ")",
    );
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = gradient;
    context.fillRect(width - cornerSize, 0, cornerSize, cornerSize);
  }

  // Bottom-left corner
  if (viewport.bottom < worldSize.gridHeight && viewport.left > 0) {
    const gradient = context.createRadialGradient(
      0,
      height,
      0,
      0,
      height,
      cornerSize,
    );
    gradient.addColorStop(
      0,
      "rgba(0, 0, 0, " + (shadowOpacity * 0.7).toString() + ")",
    );
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, height - cornerSize, cornerSize, cornerSize);
  }

  // Bottom-right corner
  if (
    viewport.bottom < worldSize.gridHeight &&
    viewport.right < worldSize.gridWidth
  ) {
    const gradient = context.createRadialGradient(
      width,
      height,
      0,
      width,
      height,
      cornerSize,
    );
    gradient.addColorStop(
      0,
      "rgba(0, 0, 0, " + (shadowOpacity * 0.7).toString() + ")",
    );
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = gradient;
    context.fillRect(
      width - cornerSize,
      height - cornerSize,
      cornerSize,
      cornerSize,
    );
  }

  context.restore();
};
