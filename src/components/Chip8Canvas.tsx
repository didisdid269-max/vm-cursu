import { useEffect, useRef } from "react";
import { DISPLAY_HEIGHT, DISPLAY_WIDTH } from "@/core/constants";
import type { Display } from "@/core/Display";

type Chip8CanvasProps = {
  display: Display;
  /** Bumped each emulation frame to trigger canvas redraw. */
  frame: number;
  scale?: number;
  foreground?: string;
  background?: string;
};

export function Chip8Canvas({
  display,
  frame,
  scale = 10,
  foreground = "#9ece6a",
  background = "#1a1b26",
}: Chip8CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, DISPLAY_WIDTH * scale, DISPLAY_HEIGHT * scale);

    for (let y = 0; y < DISPLAY_HEIGHT; y++) {
      for (let x = 0; x < DISPLAY_WIDTH; x++) {
        if (!display.getPixel(x, y)) continue;
        ctx.fillStyle = foreground;
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }, [display, frame, scale, foreground, background]);

  return (
    <canvas
      ref={canvasRef}
      width={DISPLAY_WIDTH * scale}
      height={DISPLAY_HEIGHT * scale}
      aria-label="Chip-8 display"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
