export const drawGrid = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number,
) => {
  context.strokeStyle = "#059669";
  context.lineWidth = 1;
  context.globalAlpha = 0.3; // Make grid more subtle

  context.beginPath();

  // Draw vertical lines
  for (let x = 0; x <= width; x += gridSize) {
    context.moveTo(x, 0);
    context.lineTo(x, height);
  }

  // Draw horizontal lines
  for (let y = 0; y <= height; y += gridSize) {
    context.moveTo(0, y);
    context.lineTo(width, y);
  }

  context.stroke();
  context.globalAlpha = 1; // Reset alpha
};
