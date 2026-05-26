import type { PresetData } from '../types';
import { AudioPatternUtility } from './AudioPatternUtility';

// Cache rendered buffers per preset (keyed by name) — many node ids share one
// preset after descendant-mapping, so rendering once per preset is enough.
const cache = new Map<string, AudioPatternUtility>();

export async function playPreset(data: PresetData) {
  let util = cache.get(data.name);
  if (!util) {
    util = new AudioPatternUtility();
    await util.parsePattern(data);
    cache.set(data.name, util);
  }
  await util.play();
}

export function stopAll() {
  for (const u of cache.values()) u.stop();
}
