import { REGISTER_COUNT, STACK_DEPTH } from "./constants";
import { Display } from "./Display";
import { executeOpcode } from "./instructions";
import { Memory } from "./Memory";

export class CPU {
  readonly V = new Uint8Array(REGISTER_COUNT);
  I = 0;
  pc = 0;
  sp = 0;
  readonly stack = new Uint16Array(STACK_DEPTH);

  delayTimer = 0;
  soundTimer = 0;

  /** Key state for keypad 0–F (index 0–15). */
  readonly keys = new Array<boolean>(16).fill(false);

  waitingForKey = false;
  keyRegister = 0;

  constructor(
    readonly memory: Memory,
    readonly display: Display,
  ) {}

  reset(programCounter: number): void {
    this.V.fill(0);
    this.I = 0;
    this.pc = programCounter;
    this.sp = 0;
    this.stack.fill(0);
    this.delayTimer = 0;
    this.soundTimer = 0;
    this.keys.fill(false);
    this.waitingForKey = false;
    this.display.clear();
  }

  setKey(key: number, pressed: boolean): void {
    if (key < 0 || key > 15) return;
    this.keys[key] = pressed;
    if (pressed && this.waitingForKey) {
      this.V[this.keyRegister] = key;
      this.waitingForKey = false;
    }
  }

  /** Run one fetch-decode-execute cycle. Returns false if waiting for input. */
  step(): boolean {
    if (this.waitingForKey) return false;

    const opcode = this.memory.readWord(this.pc);
    this.pc += 2;
    executeOpcode(this, opcode);
    return !this.waitingForKey;
  }

  tickTimers(): void {
    if (this.delayTimer > 0) this.delayTimer--;
    if (this.soundTimer > 0) {
      this.soundTimer--;
      // Hook for Web Audio beep could go here when soundTimer hits 0
    }
  }
}
