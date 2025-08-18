export const drawTurboOverlay = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  tintStrength = 0.15,
) => {
  context.save();

  // Vignette glow
  const gradient = context.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.2,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.7,
  );
  gradient.addColorStop(0, `rgba(255, 255, 255, ${tintStrength * 0.15})`);
  gradient.addColorStop(1, `rgba(255, 215, 0, ${tintStrength})`); // golden tint
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  // Subtle speed streaks
  context.globalAlpha = tintStrength * 0.5;
  context.strokeStyle = "rgba(255, 255, 255, 0.5)";
  context.lineWidth = 1;

  const spacing = 18;
  context.translate(width / 2, height / 2);
  context.rotate(-0.2); // slight angle
  context.translate(-width / 2, -height / 2);

  for (let y = -spacing * 2; y < height + spacing * 2; y += spacing) {
    context.beginPath();
    context.moveTo(-20, y);
    context.lineTo(width + 20, y + 8);
    context.stroke();
  }

  context.restore();
};
