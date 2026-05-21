import { FONT_START } from "./constants";
import type { CPU } from "./CPU";

type OpcodeHandler = (cpu: CPU, opcode: number) => void;

const handlers: Record<number, OpcodeHandler> = {
  0x0: handle0xxx,
  0x1: (cpu, op) => {
    cpu.pc = op & 0x0fff;
  },
  0x2: (cpu, op) => {
    cpu.stack[cpu.sp] = cpu.pc;
    cpu.sp++;
    cpu.pc = op & 0x0fff;
  },
  0x3: (cpu, op) => {
    const x = (op >> 8) & 0x0f;
    const nn = op & 0x00ff;
    if (cpu.V[x] === nn) cpu.pc += 2;
  },
  0x4: (cpu, op) => {
    const x = (op >> 8) & 0x0f;
    const nn = op & 0x00ff;
    if (cpu.V[x] !== nn) cpu.pc += 2;
  },
  0x5: (cpu, op) => {
    const x = (op >> 8) & 0x0f;
    const y = (op >> 4) & 0x0f;
    if (cpu.V[x] === cpu.V[y]) cpu.pc += 2;
  },
  0x6: (cpu, op) => {
    const x = (op >> 8) & 0x0f;
    cpu.V[x] = op & 0x00ff;
  },
  0x7: (cpu, op) => {
    const x = (op >> 8) & 0x0f;
    cpu.V[x] = (cpu.V[x] + (op & 0x00ff)) & 0xff;
  },
  0x8: handle8xy0,
  0x9: (cpu, op) => {
    cpu.pc = (op & 0x0fff) + cpu.V[0];
  },
  0xa: (cpu, op) => {
    cpu.I = op & 0x0fff;
  },
  0xb: (cpu, op) => {
    cpu.pc = (op & 0x0fff) + cpu.V[0];
  },
  0xc: (cpu, op) => {
    const x = (op >> 8) & 0x0f;
    const nn = op & 0x00ff;
    cpu.V[x] = Math.floor(Math.random() * 256) & nn;
  },
  0xd: handleDxyn,
  0xe: handleExxx,
  0xf: handleFxxx,
};

export function executeOpcode(cpu: CPU, opcode: number): void {
  const high = (opcode >> 12) & 0x0f;
  const handler = handlers[high];
  if (!handler) {
    throw new Error(`Unknown opcode: 0x${opcode.toString(16).padStart(4, "0")}`);
  }
  handler(cpu, opcode);
}

function handle0xxx(cpu: CPU, opcode: number): void {
  switch (opcode) {
    case 0x00e0:
      cpu.display.clear();
      break;
    case 0x00ee:
      cpu.sp--;
      cpu.pc = cpu.stack[cpu.sp];
      break;
    default:
      throw new Error(`Unknown 0x0 opcode: 0x${opcode.toString(16)}`);
  }
}

function handle8xy0(cpu: CPU, opcode: number): void {
  const x = (opcode >> 8) & 0x0f;
  const y = (opcode >> 4) & 0x0f;
  const sub = opcode & 0x000f;

  switch (sub) {
    case 0x0:
      cpu.V[x] = cpu.V[y];
      break;
    case 0x1:
      cpu.V[x] |= cpu.V[y];
      break;
    case 0x2:
      cpu.V[x] &= cpu.V[y];
      break;
    case 0x3:
      cpu.V[x] ^= cpu.V[y];
      break;
    case 0x4: {
      const sum = cpu.V[x] + cpu.V[y];
      cpu.V[0xf] = sum > 0xff ? 1 : 0;
      cpu.V[x] = sum & 0xff;
      break;
    }
    case 0x5: {
      cpu.V[0xf] = cpu.V[x] >= cpu.V[y] ? 1 : 0;
      cpu.V[x] -= cpu.V[y];
      break;
    }
    case 0x6: {
      cpu.V[0xf] = cpu.V[x] & 1;
      cpu.V[x] >>= 1;
      break;
    }
    case 0x7: {
      cpu.V[0xf] = cpu.V[y] >= cpu.V[x] ? 1 : 0;
      cpu.V[x] = cpu.V[y] - cpu.V[x];
      break;
    }
    case 0xe: {
      cpu.V[0xf] = cpu.V[x] >> 7;
      cpu.V[x] <<= 1;
      break;
    }
    default:
      throw new Error(`Unknown 0x8 opcode: 0x${opcode.toString(16)}`);
  }
}

function handleDxyn(cpu: CPU, opcode: number): void {
  const x = (opcode >> 8) & 0x0f;
  const y = (opcode >> 4) & 0x0f;
  const n = opcode & 0x000f;

  let vf = 0;
  for (let row = 0; row < n; row++) {
    const spriteByte = cpu.memory.readByte(cpu.I + row);
    vf |= cpu.display.drawByte(cpu.V[x], cpu.V[y] + row, spriteByte);
  }
  cpu.V[0xf] = vf ? 1 : 0;
}

function handleExxx(cpu: CPU, opcode: number): void {
  const x = (opcode >> 8) & 0x0f;
  const sub = opcode & 0x00ff;

  if (sub === 0x9e) {
    if (cpu.keys[cpu.V[x]]) cpu.pc += 2;
  } else if (sub === 0xa1) {
    if (!cpu.keys[cpu.V[x]]) cpu.pc += 2;
  } else {
    throw new Error(`Unknown 0xE opcode: 0x${opcode.toString(16)}`);
  }
}

function handleFxxx(cpu: CPU, opcode: number): void {
  const x = (opcode >> 8) & 0x0f;
  const sub = opcode & 0x00ff;

  switch (sub) {
    case 0x07:
      cpu.V[x] = cpu.delayTimer;
      break;
    case 0x0a:
      cpu.waitingForKey = true;
      cpu.keyRegister = x;
      cpu.pc -= 2;
      break;
    case 0x15:
      cpu.delayTimer = cpu.V[x];
      break;
    case 0x18:
      cpu.soundTimer = cpu.V[x];
      break;
    case 0x1e:
      cpu.I += cpu.V[x];
      break;
    case 0x29:
      cpu.I = FONT_START + cpu.V[x] * 5;
      break;
    case 0x33: {
      let value = cpu.V[x];
      cpu.memory.writeByte(cpu.I, Math.floor(value / 100));
      cpu.memory.writeByte(cpu.I + 1, Math.floor((value % 100) / 10));
      cpu.memory.writeByte(cpu.I + 2, value % 10);
      break;
    }
    case 0x55:
      for (let i = 0; i <= x; i++) {
        cpu.memory.writeByte(cpu.I + i, cpu.V[i]);
      }
      break;
    case 0x65:
      for (let i = 0; i <= x; i++) {
        cpu.V[i] = cpu.memory.readByte(cpu.I + i);
      }
      break;
    default:
      throw new Error(`Unknown 0xF opcode: 0x${opcode.toString(16)}`);
  }
}
