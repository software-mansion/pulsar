import { AudioPatternUtility } from './AudioPatternUtility';
import type { PresetData } from '../../shared/types';

// Audio playback for the plugin. Backed by AudioPatternUtility — a verbatim copy
// of the docs' WebAudio renderer (pulsar/docs/src/content/docs/components/Preset/
// audio-player.ts) — so the heard result matches the documentation exactly.
// Inside the Figma iframe there's no vibration API, so audio is the only output.
// Mirrors figma/preview/src/audio/player.ts; keep the two in sync.

// One renderer per binding id so the parsed pattern and rendered audio buffer
// are cached and reused on repeated plays.
const cache = new Map<string, AudioPatternUtility>();

export async function playPreset(id: string, data: PresetData): Promise<void> {
  let util = cache.get(id);
  if (!util) {
    util = new AudioPatternUtility();
    await util.parsePattern(data);
    cache.set(id, util);
  }
  await util.play();
}

export function stopAll(): void {
  for (const u of cache.values()) u.stop();
}
