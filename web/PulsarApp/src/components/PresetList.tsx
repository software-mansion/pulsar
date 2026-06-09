import { useMemo, useState } from "react";
import { presets } from "../pulsar";
import { PatternSvg } from "./PatternSvg";

interface Props {
  log: (message: string) => void;
}

export function PresetList({ log }: Props) {
  const [filter, setFilter] = useState("");
  const all = useMemo(() => presets.all(), []);

  const filtered = useMemo(() => {
    const lower = filter.trim().toLowerCase();
    if (!lower) return all;
    return all.filter((p) => p.name.toLowerCase().includes(lower));
  }, [all, filter]);

  const play = async (name: string) => {
    const result = await presets.play(name);
    log(`presets.play("${name}") → haptics=${result.haptics} audio=${result.audio}`);
  };

  return (
    <section className="panel">
      <h2>Presets</h2>
      <input
        className="preset-search"
        placeholder="Filter presets…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      {filtered.length === 0 ? (
        <div className="log">No presets match "{filter}".</div>
      ) : (
        <div className="preset-grid">
          {filtered.map((preset) => (
            <button
              key={preset.name}
              className="preset-button"
              onClick={() => play(preset.name)}
            >
              {preset.name}
              <PatternSvg pattern={preset.pattern} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
