import Pulsar, { Preset } from "@pulsar/haptics";

const pulsar = new Pulsar();
const presets = pulsar.getPresets();
const realtime = pulsar.getRealtimeComposer();
const patternComposer = pulsar.getPatternComposer();

const app = document.getElementById("app")!;

const supported = pulsar.isHapticsSupported();

app.innerHTML = `
  <header>
    <h1>PulsarApp</h1>
    <span class="support-badge ${supported ? "" : "unsupported"}">
      ${supported ? "Haptics available" : "Haptics unavailable"}
    </span>
  </header>

  <section class="panel">
    <h2>Pulsar API</h2>
    <div class="toggle-row">
      <label class="toggle">
        <input type="checkbox" id="toggle-haptics" checked />
        enableHaptics
      </label>
      <label class="toggle">
        <input type="checkbox" id="toggle-sound" checked />
        enableSound
      </label>
    </div>
    <div class="api-grid">
      <div class="api-card">
        <code>isHapticsSupported()</code>
        <span class="desc">Reports Web Vibration API availability.</span>
        <button data-api="isHapticsSupported">Call</button>
      </div>
      <div class="api-card">
        <code>stopHaptics()</code>
        <span class="desc">Stops every currently playing vibration.</span>
        <button data-api="stopHaptics" class="danger">Call</button>
      </div>
      <div class="api-card">
        <code>getPresets().list()</code>
        <span class="desc">All preset names registered in the library.</span>
        <button data-api="listPresets">Call</button>
      </div>
      <div class="api-card">
        <code>PatternComposer.play()</code>
        <span class="desc">Parses and plays a one-shot custom pattern.</span>
        <button data-api="patternComposerDemo">Play demo</button>
      </div>
      <div class="api-card">
        <code>RealtimeComposer.set(i, f)</code>
        <span class="desc">Center the touchpad below to drive it.</span>
        <button data-api="realtimePulse">Pulse 1s</button>
      </div>
      <div class="api-card">
        <code>RealtimeComposer.stop()</code>
        <span class="desc">Stops the realtime PWM loop.</span>
        <button data-api="realtimeStop">Stop</button>
      </div>
    </div>
    <div class="log" id="api-log">Ready.</div>
  </section>

  <section class="panel">
    <h2>Realtime composer pad</h2>
    <div class="pad" id="pad">
      <div class="pad-axes"></div>
      <span class="pad-label x">x → frequency</span>
      <span class="pad-label y">y → intensity</span>
      <div class="pad-cursor"></div>
    </div>
    <div class="pad-values">
      <div>intensity (y)<strong id="val-intensity">0.00</strong></div>
      <div>frequency (x)<strong id="val-frequency">0.00</strong></div>
    </div>
  </section>

  <section class="panel">
    <h2>Presets</h2>
    <input class="preset-search" id="preset-search" placeholder="Filter presets…" />
    <div id="preset-list"></div>
  </section>
`;

const log = (msg: string) => {
  const el = document.getElementById("api-log")!;
  const ts = new Date().toLocaleTimeString();
  el.textContent = `[${ts}] ${msg}\n` + el.textContent;
};

document.getElementById("toggle-haptics")!.addEventListener("change", (e) => {
  const v = (e.target as HTMLInputElement).checked;
  pulsar.enableHaptics(v);
  log(`enableHaptics(${v})`);
});

document.getElementById("toggle-sound")!.addEventListener("change", (e) => {
  const v = (e.target as HTMLInputElement).checked;
  pulsar.enableSound(v);
  log(`enableSound(${v})`);
});

document.querySelectorAll("button[data-api]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const api = (btn as HTMLButtonElement).dataset.api!;
    switch (api) {
      case "isHapticsSupported":
        log(`isHapticsSupported() → ${pulsar.isHapticsSupported()}`);
        break;
      case "stopHaptics":
        log(`stopHaptics() → ${pulsar.stopHaptics()}`);
        break;
      case "listPresets": {
        const names = presets.list();
        log(`getPresets().list() → ${names.length} presets`);
        break;
      }
      case "patternComposerDemo": {
        patternComposer.parse([
          { type: "continuous", timestamp: 0, duration: 40 },
          { type: "pulse", timestamp: 120, duration: 250, intensity: 0.6, frequency: 0.8 },
          { type: "continuous", timestamp: 420, duration: 80 },
        ]);
        const ok = patternComposer.play();
        log(`PatternComposer.play() → ${ok}`);
        break;
      }
      case "realtimePulse": {
        const ok = realtime.set(0.7, 0.7);
        log(`RealtimeComposer.set(0.7, 0.7) → ${ok}`);
        setTimeout(() => {
          realtime.stop();
          log("RealtimeComposer.stop() (auto after 1s)");
        }, 1000);
        break;
      }
      case "realtimeStop":
        log(`RealtimeComposer.stop() → ${realtime.stop()}`);
        break;
    }
  });
});

// Pad — touch/pointer driven realtime composer
const pad = document.getElementById("pad") as HTMLDivElement;
const valIntensity = document.getElementById("val-intensity")!;
const valFrequency = document.getElementById("val-frequency")!;

let padActive = false;

const updatePad = (clientX: number, clientY: number) => {
  const rect = pad.getBoundingClientRect();
  const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  const yFromTop = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
  const intensity = 1 - yFromTop;
  const frequency = x;

  pad.style.setProperty("--x", `${x * 100}%`);
  pad.style.setProperty("--y", `${yFromTop * 100}%`);
  const cursor = pad.querySelector(".pad-cursor") as HTMLDivElement;
  cursor.style.left = `${x * 100}%`;
  cursor.style.top = `${yFromTop * 100}%`;

  valIntensity.textContent = intensity.toFixed(2);
  valFrequency.textContent = frequency.toFixed(2);

  realtime.set(intensity, frequency);
};

const onDown = (e: PointerEvent) => {
  padActive = true;
  pad.classList.add("active");
  pad.setPointerCapture(e.pointerId);
  updatePad(e.clientX, e.clientY);
};

const onMove = (e: PointerEvent) => {
  if (!padActive) return;
  updatePad(e.clientX, e.clientY);
};

const onUp = (e: PointerEvent) => {
  if (!padActive) return;
  padActive = false;
  pad.classList.remove("active");
  pad.releasePointerCapture(e.pointerId);
  realtime.stop();
};

pad.addEventListener("pointerdown", onDown);
pad.addEventListener("pointermove", onMove);
pad.addEventListener("pointerup", onUp);
pad.addEventListener("pointercancel", onUp);

// Presets list — grouped by category
const presetList = document.getElementById("preset-list")!;
const search = document.getElementById("preset-search") as HTMLInputElement;

const allPresets: Preset[] = presets.all();

const renderPresets = (filter: string) => {
  const lower = filter.trim().toLowerCase();
  const filtered = lower
    ? allPresets.filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.category.toLowerCase().includes(lower) ||
          p.description.toLowerCase().includes(lower),
      )
    : allPresets;

  presetList.innerHTML = "";

  if (filtered.length === 0) {
    presetList.innerHTML = `<div class="log">No presets match "${filter}".</div>`;
    return;
  }

  const grid = document.createElement("div");
  grid.className = "preset-grid";
  for (const preset of filtered) {
    const button = document.createElement("button");
    button.className = "preset-button";
    button.innerHTML = `
      ${preset.name}
      <span class="description">${preset.description}</span>
      ${renderPatternSvg(preset.pattern)}
    `;
    button.addEventListener("click", async () => {
      const result = await presets.play(preset.name);
      log(`presets.play("${preset.name}") → haptics=${result.haptics} audio=${result.audio}`);
    });
    grid.appendChild(button);
  }
  presetList.appendChild(grid);
};

type PatternEntry = Preset["pattern"][number];

const renderPatternSvg = (pattern: PatternEntry[]) => {
  if (pattern.length === 0) {
    return `<svg class="pattern-svg" viewBox="0 0 100 24" preserveAspectRatio="none"></svg>`;
  }

  const totalDuration = pattern.reduce(
    (max, entry) => Math.max(max, entry.timestamp + entry.duration),
    0,
  );
  if (totalDuration <= 0) {
    return `<svg class="pattern-svg" viewBox="0 0 100 24" preserveAspectRatio="none"></svg>`;
  }

  const width = 100;
  const height = 24;
  const baseline = height - 2;
  const scale = (ms: number) => (ms / totalDuration) * width;

  const shapes: string[] = [];

  for (const entry of pattern) {
    const x = scale(entry.timestamp);
    const w = Math.max(0.6, scale(entry.duration));

    if (entry.type === "continuous") {
      shapes.push(
        `<rect x="${x}" y="2" width="${w}" height="${baseline - 2}" rx="1" fill="var(--accent)" opacity="0.85" />`,
      );
      continue;
    }

    if (entry.type === "pulse") {
      const intensity = clamp01(entry.intensity ?? 0.5);
      const frequency = clamp01(entry.frequency ?? 0.5);
      const barHeight = (baseline - 4) * (0.35 + intensity * 0.65);
      const ticks = Math.max(2, Math.round(2 + frequency * 10));
      const tickWidth = w / (ticks * 2);
      for (let i = 0; i < ticks; i += 1) {
        const tx = x + i * tickWidth * 2;
        shapes.push(
          `<rect x="${tx}" y="${baseline - barHeight}" width="${Math.max(0.4, tickWidth)}" height="${barHeight}" fill="var(--accent)" opacity="0.85" />`,
        );
      }
      continue;
    }

    if (entry.type === "line") {
      const segments = 24;
      const points: string[] = [];
      for (let i = 0; i <= segments; i += 1) {
        const t = (i / segments) * entry.duration;
        const value = sampleAt(entry.intensity, t, entry.duration);
        const px = x + (i / segments) * w;
        const py = baseline - (baseline - 2) * value;
        points.push(`${px.toFixed(2)},${py.toFixed(2)}`);
      }
      shapes.push(
        `<polyline points="${points.join(" ")}" fill="none" stroke="var(--accent)" stroke-width="1.2" opacity="0.9" />`,
      );
    }
  }

  return `<svg class="pattern-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
    <line x1="0" y1="${baseline}" x2="${width}" y2="${baseline}" stroke="var(--panel-border)" stroke-width="0.5" />
    ${shapes.join("")}
  </svg>`;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const sampleAt = (
  points: { time: number; value: number }[],
  time: number,
  duration: number,
) => {
  if (points.length === 0) {
    return 0.5;
  }
  const sorted = [...points].sort((a, b) => a.time - b.time);
  if (time <= sorted[0]!.time) {
    return clamp01(sorted[0]!.value);
  }
  const last = sorted[sorted.length - 1]!;
  if (time >= last.time || time >= duration) {
    return clamp01(last.value);
  }
  for (let i = 0; i < sorted.length - 1; i += 1) {
    const a = sorted[i]!;
    const b = sorted[i + 1]!;
    if (time >= a.time && time <= b.time) {
      const span = b.time - a.time;
      if (span <= 0) return clamp01(b.value);
      const progress = (time - a.time) / span;
      return clamp01(a.value + (b.value - a.value) * progress);
    }
  }
  return clamp01(last.value);
};

search.addEventListener("input", () => renderPresets(search.value));
renderPresets("");

log(`Loaded ${allPresets.length} built-in presets.`);
