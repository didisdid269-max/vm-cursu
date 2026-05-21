import { CYCLES_PER_FRAME, PROGRAM_START } from "./constants";
import { CPU } from "./CPU";
import { Display } from "./Display";
import { Memory } from "./Memory";

export class Chip8 {
  readonly memory = new Memory();
  readonly display = new Display();
  readonly cpu = new CPU(this.memory, this.display);

  private running = false;

  loadRom(data: Uint8Array): void {
    this.memory.reset();
    this.memory.loadProgram(data);
    this.cpu.reset(PROGRAM_START);
    this.running = true;
  }

  stop(): void {
    this.running = false;
  }

  isRunning(): boolean {
    return this.running;
  }

  /** Advance emulation by one display frame worth of cycles. */
  tickFrame(): void {
    if (!this.running) return;

    for (let i = 0; i < CYCLES_PER_FRAME; i++) {
      if (!this.cpu.step()) break;
    }
    this.cpu.tickTimers();
  }

  setKey(key: number, pressed: boolean): void {
    this.cpu.setKey(key, pressed);
  }
}
