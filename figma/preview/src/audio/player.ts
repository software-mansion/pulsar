import { AudioPatternUtility } from './AudioPatternUtility';
import type { PresetData } from '../types';

// Audio playback for the standalone preview. Backed by AudioPatternUtility — a
// verbatim copy of the docs' WebAudio renderer (pulsar/docs/src/content/docs/
// components/Preset/audio-player.ts) — so the heard result matches the
// documentation exactly. Mirrors figma/src/ui/audio/player.ts; keep in sync.

// One renderer per preset name so the parsed pattern and rendered audio buffer
// are cached and reused on repeated plays.
const cache = new Map<string, AudioPatternUtility>();

export async function playPreset(data: PresetData): Promise<void> {
  let util = cache.get(data.name);
  if (!util) {
    util = new AudioPatternUtility();
    await util.parsePattern(data);
    cache.set(data.name, util);
  }
  await util.play();
}

export function stopAll(): void {
  for (const u of cache.values()) u.stop();
}
