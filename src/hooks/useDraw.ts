import { useEffect, useRef, useState } from "react";

export const useDraw = (
  onDraw: ({ ctx, currentPoint, prevPoint }: Draw) => void
) => {
  const [mouseDown, setMouseDown] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevPoint = useRef<Point | null>(null);

  const onMouseDown = () => {
    setMouseDown(true);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    const handlemouseup = () => {
      setMouseDown(false);
      prevPoint.current = null;
    };

    const handlemousemove = (e: MouseEvent) => {
      if (!mouseDown) return;

      const currentPoint = computeCanvasPoint(e);

      const ctx = canvasRef.current?.getContext("2d");

      if (!ctx || !currentPoint) return;

      onDraw({ ctx, currentPoint, prevPoint: prevPoint.current });
      prevPoint.current = currentPoint;
    };

    const computeCanvasPoint = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      return { x, y };
    };
    const current = canvasRef.current;
    current?.addEventListener("mousemove", handlemousemove);
    window.addEventListener("mouseup", handlemouseup);

    return () => {
      current?.removeEventListener("mousemove", handlemousemove);
      window.removeEventListener("mouseup", handlemouseup);
    };
  }, [mouseDown, onDraw]);

  return { canvasRef, onMouseDown, clear };
};
