import { RefObject, useEffect } from "react";
import { drawLine } from "../lib/drawLine";
import { Socket } from "socket.io-client";

type DrawLineEmitProps = {
  prevPoint: Point | null;
  currentPoint: Point;
  color: string;
  canvasWidth: number;
  canvasHeight: number;
};

export const useSocketDraw = (
  canvasRef: RefObject<HTMLCanvasElement>,
  socket: Socket,
  clear: () => void
) => {
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");

    socket.on("draw_line", (data: DrawLineEmitProps) => {
      const { prevPoint, currentPoint, color, canvasWidth, canvasHeight } =
        data;
      if (!ctx) return;

      // Scale the points to the canvas size based on the original canvas size
      if (!canvasRef.current) {
        drawLine({ prevPoint, currentPoint, ctx, color });
        return;
      }

      const currentWidth = canvasRef.current.width || 0;
      const currentHeight = canvasRef.current.height || 0;

      const scaleX = currentWidth / canvasWidth;
      const scaleY = currentHeight / canvasHeight;
      if (scaleX && scaleY) {
        if (prevPoint) {
          prevPoint.x *= scaleX;
          prevPoint.y *= scaleY;
        }
        currentPoint.x *= scaleX;
        currentPoint.y *= scaleY;
      }

      drawLine({ prevPoint, currentPoint, ctx, color });
    });

    // socket.on("get_canvas_state", () => {
    //   if (!canvasRef.current?.toDataURL) return;
    //   socket.emit("canvas_state", canvasRef.current.toDataURL());
    // });

    // socket.on("canvas_state_from_server", (data: string) => {
    //   const img = new Image();
    //   img.src = data;
    //   console.log("img", img);
    //   img.onload = () => {
    //     if (!ctx) return;
    //     ctx.drawImage(img, 0, 0);
    //   };
    // });

    socket.on("clear", clear);

    return () => {
      socket.off("draw_line");
      // socket.off("get_canvas_state");
      // socket.off("canvas_state_from_server");
      socket.off("clear");
    };
  }, [canvasRef, socket, clear]);
};
