import { useCallback } from "react";
import { Chip8Canvas } from "@/components/Chip8Canvas";
import { useChip8 } from "@/hooks/useChip8";
import "./App.css";

export default function App() {
  const { chip8, frame, romName, error, loadDemoRom, loadRom, reset, handleKey } =
    useChip8();

  const onRomChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void loadRom(file);
      e.target.value = "";
    },
    [loadRom],
  );

  return (
    <div className="app">
      <header>
        <h1>Chip-8 Emulator</h1>
        <p className="subtitle">TypeScript · React · HTML5 Canvas</p>
      </header>

      <main>
        <Chip8Canvas display={chip8.display} frame={frame} scale={12} />

        <section className="controls">
          <button type="button" className="primary" onClick={loadDemoRom}>
            Start .ch8 ROM
          </button>
          <label className="upload">
            <span>Upload your own</span>
            <input
              type="file"
              accept=".ch8,.CH8"
              onChange={onRomChange}
            />
          </label>
          <button type="button" onClick={reset} disabled={!romName}>
            Reset
          </button>
        </section>

        {romName && (
          <p className="status">
            Running: <strong>{romName}</strong>
            <span className="frame" aria-hidden>
              {" "}
              (frame {frame})
            </span>
          </p>
        )}
        {error && <p className="error">{error}</p>}

        <section
          className="keypad"
          tabIndex={0}
          onKeyDown={(e) => {
            handleKey(e.key, true);
            e.preventDefault();
          }}
          onKeyUp={(e) => handleKey(e.key, false)}
        >
          <h2>Keypad</h2>
          <p className="hint">Click here, then use the layout below (or click keys).</p>
          <div className="keys">
            {[
              ["1", "2", "3", "4"],
              ["Q", "W", "E", "R"],
              ["A", "S", "D", "F"],
              ["Z", "X", "C", "V"],
            ].map((row) => (
              <div key={row.join("")} className="key-row">
                {row.map((label) => (
                  <button
                    key={label}
                    type="button"
                    className="key"
                    onMouseDown={() => handleKey(label, true)}
                    onMouseUp={() => handleKey(label, false)}
                    onMouseLeave={() => handleKey(label, false)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
