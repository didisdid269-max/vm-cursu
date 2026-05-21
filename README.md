# Chip-8 Emulator

Web-based Chip-8 interpreter built with TypeScript and React.

## Architecture

```
src/core/
  constants.ts   — RAM size, display dimensions, font data
  Memory.ts      — 4KB RAM, font load, ROM load
  Display.ts     — 64×32 framebuffer, sprite XOR draw
  CPU.ts         — registers V0–VF, I, PC, stack, timers, keys
  instructions.ts — opcode decode & execute (0x0–0xF families)
  Chip8.ts       — ties Memory + Display + CPU, frame loop
src/components/
  Chip8Canvas.tsx — HTML5 Canvas renderer
src/hooks/
  useChip8.ts    — ROM upload, animation loop, keyboard map
```

## Run locally

```bash
cd C:\Users\diddy\Projects\chip8-emulator
npm install
npm run dev
```

Open the dev server URL, load a `.ch8` ROM, and use the on-screen keypad (or keyboard: `1–4`, `QWER`, `ASDF`, `ZXCV`).

## Test ROMs

Public Chip-8 ROMs (e.g. IBM logo, Pong, Tetris) are available from community collections such as [Timendus/chip8-test-roms](https://github.com/Timendus/chip8-test-roms).
