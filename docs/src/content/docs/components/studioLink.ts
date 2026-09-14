import { STUDIO_URL } from './config';
import type { PatternData } from './Preset/types';

// Studio resolves the pattern by name from its vendored copy of this library.
export function buildStudioEditUrl(data: PatternData): string {
  return `${STUDIO_URL}/open?preset=${encodeURIComponent(data.name)}`;
}

export function openInStudio(data: PatternData): void {
  window.open(buildStudioEditUrl(data), '_blank', 'noopener');
}
