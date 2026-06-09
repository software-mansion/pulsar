import { useCallback, useState } from "react";
import { pulsar, presets } from "./pulsar";
import { ApiPanel } from "./components/ApiPanel";
import { RealtimePad } from "./components/RealtimePad";
import { PresetList } from "./components/PresetList";

const supported = pulsar.isHapticsSupported();

export function App() {
  const [logLines, setLogLines] = useState<string[]>(() => [
    `Loaded ${presets.list().length} built-in presets.`,
    "Ready.",
  ]);

  const log = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString();
    setLogLines((prev) => [`[${ts}] ${msg}`, ...prev].slice(0, 50));
  }, []);

  return (
    <>
      <header>
        <h1>PulsarApp</h1>
        <span className={`support-badge${supported ? "" : " unsupported"}`}>
          {supported ? "Haptics available" : "Haptics unavailable"}
        </span>
      </header>

      <ApiPanel log={log} />

      <RealtimePad />

      <PresetList log={log} />

      <section className="panel">
        <h2>Log</h2>
        <div className="log">{logLines.join("\n")}</div>
      </section>
    </>
  );
}
