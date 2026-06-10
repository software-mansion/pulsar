import { Pulsar, Preset, type HapticPattern } from 'pulsar-haptics';
import type { PresetData } from '../types';

// Shared package instance. `Pulsar` keeps its own `Presets` and
// `RealtimeComposer` internally; we use it both for the rare built-in match and
// for the audio fallback that `Preset.play()` performs when no vibration API is
// available — which is what the desktop preview relies on.
const pulsar = new Pulsar();
const presets = pulsar.getPresets();

// One Preset wrapper per figma binding name so the package can cache its parsed
// pattern and rendered audio buffer (it does both internally — see
// web/Pulsar/src/Presets.ts).
const customCache = new Map<string, Preset>();

// Adapt figma's iOS-Core-Haptics-style `PresetData` (separate discretePattern +
// continuousPattern arrays) into the package's segment-based `HapticPattern`.
// Two segments at most:
//   - one short "continuous" segment per discrete tick (≈30ms tap)
//   - one "line" segment spanning the duration with the continuous envelope's
//     amplitude/frequency control points
// The web SDK doesn't expose the iOS-Core-Haptics shape natively, so this is a
// best-effort translation — audio rendering won't be bit-identical to the old
// hand-rolled AudioPatternUtility, but the felt rhythm matches.
function toHapticPattern(data: PresetData): HapticPattern {
  const segments: HapticPattern = data.discretePattern.map((p) => ({
    type: 'continuous' as const,
    timestamp: p.time,
    duration: 30
  }));
  const hasEnvelope =
    data.continuousPattern.amplitude.length > 0 || data.continuousPattern.frequency.length > 0;
  if (hasEnvelope) {
    segments.push({
      type: 'line' as const,
      timestamp: 0,
      duration: data.duration,
      intensity: data.continuousPattern.amplitude,
      frequency: data.continuousPattern.frequency
    });
  }
  return segments;
}

export async function playPreset(data: PresetData): Promise<void> {
  // Opportunistic shortcut: if the figma binding happens to share a name with a
  // package built-in (e.g. 'tap', 'longPress'), let the package use its tuned
  // pattern instead of our adapter.
  if (presets.has(data.name)) {
    await presets.play(data.name);
    return;
  }
  let preset = customCache.get(data.name);
  if (!preset) {
    preset = new Preset(data.name, toHapticPattern(data));
    customCache.set(data.name, preset);
  }
  await preset.play();
}

export function stopAll(): void {
  presets.stop();
  for (const p of customCache.values()) p.stop();
}
