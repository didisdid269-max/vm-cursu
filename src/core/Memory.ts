import {
  FONT_SPRITES,
  FONT_START,
  PROGRAM_START,
  RAM_SIZE,
} from "./constants";

export class Memory {
  readonly ram = new Uint8Array(RAM_SIZE);

  constructor() {
    this.loadFont();
  }

  reset(): void {
    this.ram.fill(0);
    this.loadFont();
  }

  loadFont(): void {
    this.ram.set(FONT_SPRITES, FONT_START);
  }

  /** Load a ROM into RAM starting at the program entry address. */
  loadProgram(data: Uint8Array, offset = PROGRAM_START): void {
    const maxLength = RAM_SIZE - offset;
    if (data.length > maxLength) {
      throw new Error(
        `ROM too large: ${data.length} bytes (max ${maxLength} at 0x${offset.toString(16)})`,
      );
    }
    this.ram.set(data, offset);
  }

  readByte(address: number): number {
    return this.ram[address & 0xfff];
  }

  writeByte(address: number, value: number): void {
    this.ram[address & 0xfff] = value & 0xff;
  }

  readWord(address: number): number {
    const hi = this.readByte(address);
    const lo = this.readByte(address + 1);
    return (hi << 8) | lo;
  }
}
