import { useCallback, useEffect, useRef, useState } from "react";
import { Chip8 } from "@/core/Chip8";

const KEY_MAP: Record<string, number> = {
  "1": 0x1,
  "2": 0x2,
  "3": 0x3,
  "4": 0xc,
  q: 0x4,
  w: 0x5,
  e: 0x6,
  r: 0xd,
  a: 0x7,
  s: 0x8,
  d: 0x9,
  f: 0xe,
  z: 0xa,
  x: 0x0,
  c: 0xb,
  v: 0xf,
};

export function useChip8() {
  const chip8Ref = useRef(new Chip8());
  const [frame, setFrame] = useState(0);
  const [romName, setRomName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const chip8 = chip8Ref.current;

  useEffect(() => {
    if (!running) return;

    let id = 0;
    const loop = () => {
      chip8.tickFrame();
      setFrame((f) => f + 1);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [running, chip8]);

  const loadRom = useCallback(async (file: File) => {
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      chip8.loadRom(new Uint8Array(buffer));
      setRomName(file.name);
      setRunning(true);
      setFrame(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load ROM");
      setRunning(false);
    }
  }, [chip8]);

  const reset = useCallback(() => {
    chip8.stop();
    chip8.memory.reset();
    chip8.display.clear();
    chip8.cpu.reset(0x200);
    setRunning(false);
    setRomName(null);
    setFrame((f) => f + 1);
  }, [chip8]);

  const handleKey = useCallback(
    (code: string, pressed: boolean) => {
      const key = KEY_MAP[code.toLowerCase()];
      if (key !== undefined) chip8.setKey(key, pressed);
    },
    [chip8],
  );

  return {
    chip8,
    frame,
    romName,
    error,
    running,
    loadRom,
    reset,
    handleKey,
  };
}
