import { DISPLAY_HEIGHT, DISPLAY_WIDTH } from "./constants";

export class Display {
  /** Flat framebuffer: index = y * width + x */
  readonly pixels = new Uint8Array(DISPLAY_WIDTH * DISPLAY_HEIGHT);

  clear(): void {
    this.pixels.fill(0);
  }

  getPixel(x: number, y: number): number {
    const px = x % DISPLAY_WIDTH;
    const py = y % DISPLAY_HEIGHT;
    return this.pixels[py * DISPLAY_WIDTH + px];
  }

  setPixel(x: number, y: number, value: number): void {
    const px = x % DISPLAY_WIDTH;
    const py = y % DISPLAY_HEIGHT;
    this.pixels[py * DISPLAY_WIDTH + px] = value ? 1 : 0;
  }

  /** XOR a sprite row onto the display; returns 1 if any pixel was cleared. */
  drawByte(x: number, y: number, byte: number): number {
    let collision = 0;
    for (let bit = 0; bit < 8; bit++) {
      const pixelOn = (byte >> (7 - bit)) & 1;
      if (!pixelOn) continue;

      const px = (x + bit) % DISPLAY_WIDTH;
      const py = y % DISPLAY_HEIGHT;
      const index = py * DISPLAY_WIDTH + px;
      if (this.pixels[index]) collision = 1;
      this.pixels[index] ^= 1;
    }
    return collision;
  }
}
