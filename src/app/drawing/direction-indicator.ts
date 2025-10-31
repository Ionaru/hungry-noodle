import { FoodType } from "../food/types";
import { GameState } from "../services/game-state";

export const drawFoodDirectionIndicator = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  gameState: GameState,
) => {
  const food = gameState.food();
  const snake = gameState.snake();
  const camera = gameState.camera();
  const canvasSize = gameState.canvasSize();

  if (food.length === 0 || snake.length === 0) return;

  // Find the nearest food item
  const snakeHead = snake[0];
  let nearestFood = food[0];
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const foodItem of food) {
    const distance = Math.hypot(
      foodItem.x - snakeHead.x,
      foodItem.y - snakeHead.y,
    );
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
  const distanceToRightEdge =
    cos > 0 ? (width - margin - centerX) / cos : Number.POSITIVE_INFINITY;
  const distanceToLeftEdge =
    cos < 0 ? (margin - centerX) / cos : Number.POSITIVE_INFINITY;
  const distanceToBottomEdge =
    sin > 0 ? (height - margin - centerY) / sin : Number.POSITIVE_INFINITY;
  const distanceToTopEdge =
    sin < 0 ? (margin - centerY) / sin : Number.POSITIVE_INFINITY;

  // Find the minimum positive distance (closest edge intersection)
  const minimumDistance = Math.min(
    distanceToRightEdge,
    distanceToLeftEdge,
    distanceToBottomEdge,
    distanceToTopEdge,
  );

  indicatorX = centerX + cos * minimumDistance;
  indicatorY = centerY + sin * minimumDistance;

  // Clamp to screen bounds with margin
  indicatorX = Math.max(margin, Math.min(width - margin, indicatorX));
  indicatorY = Math.max(margin, Math.min(height - margin, indicatorY));

  // Draw the directional indicator
  context.save();

  // Draw background circle
  context.fillStyle = "rgba(0, 0, 0, 0.7)";
  context.beginPath();
  context.arc(indicatorX, indicatorY, indicatorRadius + 2, 0, Math.PI * 2);
  context.fill();

  // Draw indicator circle
  const foodColor =
    nearestFood.type === FoodType.GOLDEN ? "#F59E0B" : "#EF4444";
  context.fillStyle = foodColor;
  context.beginPath();
  context.arc(indicatorX, indicatorY, indicatorRadius, 0, Math.PI * 2);
  context.fill();

  // Draw directional arrow
  context.fillStyle = "white";
  context.translate(indicatorX, indicatorY);
  context.rotate(angle);

  // Arrow shape
  const arrowSize = indicatorRadius * 0.6;
  context.beginPath();
  context.moveTo(arrowSize, 0);
  context.lineTo(-arrowSize / 2, -arrowSize / 2);
  context.lineTo(-arrowSize / 2, arrowSize / 2);
  context.closePath();
  context.fill();

  context.restore();
};
