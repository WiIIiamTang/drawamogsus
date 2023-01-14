type DrawLineProps = Draw & {
  color: string;
};

export const drawLine = ({
  prevPoint,
  currentPoint,
  ctx,
  color,
}: DrawLineProps) => {
  const { x: currX, y: currY } = currentPoint;
  const linewidth = 5;

  let startPoint = prevPoint ?? currentPoint;
  ctx.beginPath();
  ctx.lineWidth = linewidth;
  ctx.strokeStyle = color;
  ctx.moveTo(startPoint.x, startPoint.y);
  ctx.lineTo(currX, currY);
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(startPoint.x, startPoint.y, linewidth / 2, 0, Math.PI * 2);
  ctx.fill();
};
