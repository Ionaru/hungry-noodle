import { GestureDetail } from "@ionic/angular/standalone";

import { GameState } from "../services/game-state";

export const handleSwipe = (event: GestureDetail, gameState: GameState) => {
  if (gameState.gameStatus() !== "playing") return;

  const { deltaX, deltaY } = event;

  // Require minimum swipe distance for better mobile UX
  const minSwipeDistance = 30;
  const swipeDistance = Math.hypot(deltaX, deltaY);

  if (swipeDistance < minSwipeDistance) {
    return; // Ignore short swipes
  }

  // Determine the direction of the swipe with improved logic
  const absDeltaX = Math.abs(deltaX);
  const absDeltaY = Math.abs(deltaY);

  // Use a threshold to determine if it's more horizontal or vertical
  const threshold = 0.6; // Requires 60% dominance in one direction

  if (absDeltaY > absDeltaX * threshold) {
    // Vertical swipe
    if (deltaY < 0) {
      gameState.changeDirection("up");
    } else {
      gameState.changeDirection("down");
    }
  } else if (absDeltaX > absDeltaY * threshold) {
    // Horizontal swipe
    if (deltaX < 0) {
      gameState.changeDirection("left");
    } else {
      gameState.changeDirection("right");
    }
  }
  // If neither direction is dominant enough, ignore the swipe
};
