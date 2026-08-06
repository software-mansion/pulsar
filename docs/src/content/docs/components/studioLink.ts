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
  // TEMPORARY: Studio's `/open?preset=<name>` deep link isn't live yet, so route
  // users to the Studio waitlist instead. Restore the line below once Studio ships.
  // return `${STUDIO_URL}/open?preset=${encodeURIComponent(data.name)}`;
  return 'https://docs.swmansion.com/pulsar/studio/#waitlist';
}

/** Open the preset in Studio in a new tab. */
export function openInStudio(data: PatternData): void {
  window.open(buildStudioEditUrl(data), '_blank', 'noopener');
}
