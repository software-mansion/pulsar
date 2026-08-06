import { STUDIO_URL } from './config';
import type { PatternData } from './Preset/types';

/**
 * Building the "Edit in Pulsar Studio" deep link.
 *
 * We send only the preset's NAME (`?preset=<name>`); Studio resolves the full pattern
 * from its own vendored copy of this same library
 * (`studio/src/editor/library/data/pulsarLibrary.json`, synced from these docs). The
 * name is the shared key — every docs preset name matches a library entry name exactly —
 * so the link stays short and the pattern definition has a single source of truth.
 */

/** The full URL that opens this preset for editing in Studio. */
export function buildStudioEditUrl(data: PatternData): string {
  return `${STUDIO_URL}/open?preset=${encodeURIComponent(data.name)}`;
}

/** Open the preset in Studio in a new tab. */
export function openInStudio(data: PatternData): void {
  window.open(buildStudioEditUrl(data), '_blank', 'noopener');
}
