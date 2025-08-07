import { GestureDetail } from "@ionic/angular/standalone";

import { Direction, GameState } from "../services/game-state";

const determineDirection = (
  currentDirection: Direction | null,
  deltaX: number,
  deltaY: number,
): Direction | null => {
  const absDeltaX = Math.abs(deltaX);
  const absDeltaY = Math.abs(deltaY);

  const threshold = 0.6;

  if (currentDirection) {
    switch (currentDirection) {
      case "up":
      case "down": {
        return deltaX > 0 ? "right" : "left";
      }
      case "left":
      case "right": {
        return deltaY > 0 ? "down" : "up";
      }
    }
  } else if (absDeltaY > absDeltaX * threshold) {
    // Vertical swipe
    return deltaY < 0 ? "up" : "down";
  } else if (absDeltaX > absDeltaY * threshold) {
    // Horizontal swipe
    return deltaX < 0 ? "left" : "right";
  }

  return null;
};

export const handleSwipe = (event: GestureDetail, gameState: GameState) => {
  if (gameState.gameStatus() !== "playing") return;

  const { deltaX, deltaY } = event;

  // Require minimum swipe distance for better mobile UX
  const minSwipeDistance = 30;
  const swipeDistance = Math.hypot(deltaX, deltaY);

  if (swipeDistance < minSwipeDistance) {
    return; // Ignore short swipes
  }

  const currentDirection = gameState.direction();

  const newDirection = determineDirection(currentDirection, deltaX, deltaY);

  if (newDirection) {
    gameState.changeDirection(newDirection);
  }
  // If neither direction is dominant enough, ignore the swipe
  // TODO: Add metrics to track swipe direction and accuracy
};
