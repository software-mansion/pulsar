import Pulsar, { PatternComposer, Preset } from "pulsar-haptics";

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

// Visualize the actual `navigator.vibrate()` timeline that the composer will emit,
// rather than redrawing the high-level segments. This matches what is actually played.
const renderPatternSvg = (pattern: PatternEntry[]) => {
  const composer = new PatternComposer();
  const parsed = composer.parse(pattern);

  const width = 100;
  const height = 24;
  const baseline = height - 2;

  if (parsed.length === 0) {
    return `<svg class="pattern-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"></svg>`;
  }

  const totalDuration = parsed.reduce((sum, ms) => sum + ms, 0);
  if (totalDuration <= 0) {
    return `<svg class="pattern-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"></svg>`;
  }

  const scale = (ms: number) => (ms / totalDuration) * width;
  const shapes: string[] = [];
  let cursor = 0;

  // navigator.vibrate convention: alternating ON, OFF, ON, OFF... starting with ON.
  for (let i = 0; i < parsed.length; i += 1) {
    const ms = parsed[i]!;
    const isOn = i % 2 === 0;
    if (isOn && ms > 0) {
      const x = scale(cursor);
      const w = Math.max(0.5, scale(ms));
      shapes.push(
        `<rect x="${x.toFixed(2)}" y="2" width="${w.toFixed(2)}" height="${baseline - 2}" rx="1" fill="var(--accent)" opacity="0.9" />`,
      );
    }
    cursor += ms;
  }

  return `<svg class="pattern-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
    <line x1="0" y1="${baseline}" x2="${width}" y2="${baseline}" stroke="var(--panel-border)" stroke-width="0.5" />
    ${shapes.join("")}
  </svg>`;
};

search.addEventListener("input", () => renderPresets(search.value));
renderPresets("");

log(`Loaded ${allPresets.length} built-in presets.`);
