export const drawDecoration = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  gridSize: number,
  type: number,
) => {
  const centerX = x + gridSize / 2;
  const centerY = y + gridSize / 2;
  const size = gridSize * 0.3;

  switch (type) {
    case 0: {
      // Small rock
      context.fillStyle = "#6B7280";
      context.beginPath();
      context.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
      context.fill();
      break;
    }

    case 1: {
      // Flower
      context.fillStyle = "#F59E0B";
      context.beginPath();
      context.arc(centerX, centerY, size / 3, 0, Math.PI * 2);
      context.fill();
      // Petals
      context.fillStyle = "#EC4899";
      for (let index = 0; index < 4; index++) {
        const angle = (index * Math.PI) / 2;
        const petalX = centerX + (Math.cos(angle) * size) / 2;
        const petalY = centerY + (Math.sin(angle) * size) / 2;
        context.beginPath();
        context.arc(petalX, petalY, size / 4, 0, Math.PI * 2);
        context.fill();
      }
      break;
    }

    case 2: {
      // Small plant
      context.fillStyle = "#22C55E";
      context.fillRect(centerX - size / 6, centerY - size / 2, size / 3, size);
      // Leaves
      context.beginPath();
      context.arc(
        centerX - size / 3,
        centerY - size / 4,
        size / 4,
        0,
        Math.PI * 2,
      );
      context.arc(
        centerX + size / 3,
        centerY - size / 4,
        size / 4,
        0,
        Math.PI * 2,
      );
      context.fill();
      break;
    }

    case 3: {
      // Mushroom
      context.fillStyle = "#EF4444";
      context.beginPath();
      context.arc(centerX, centerY - size / 4, size / 2, 0, Math.PI);
      context.fill();
      // Stem
      context.fillStyle = "#F3F4F6";
      context.fillRect(
        centerX - size / 6,
        centerY - size / 4,
        size / 3,
        size / 2,
      );
      break;
    }

    case 4: {
      // Tiny bush
      context.fillStyle = "#16A34A";
      context.beginPath();
      context.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
      context.fill();
      // Darker outline
      context.strokeStyle = "#15803D";
      context.lineWidth = 1;
      context.stroke();
      break;
    }
  }
};
