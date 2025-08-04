import { GameState } from "../services/game-state";

export const handleKeyboard = (event: KeyboardEvent, gameState: GameState) => {
  if (gameState.gameStatus() !== "playing") return;

  switch (event.key) {
    case "ArrowUp":
    case "w":
    case "W": {
      event.preventDefault();
      gameState.changeDirection("up");
      break;
    }
    case "ArrowDown":
    case "s":
    case "S": {
      event.preventDefault();
      gameState.changeDirection("down");
      break;
    }
    case "ArrowLeft":
    case "a":
    case "A": {
      event.preventDefault();
      gameState.changeDirection("left");
      break;
    }
    case "ArrowRight":
    case "d":
    case "D": {
      event.preventDefault();
      gameState.changeDirection("right");
      break;
    }
    case " ": {
      event.preventDefault();
      gameState.pauseGame();
      break;
    }
  }
};
