// Helpers for user-supplied custom presets pasted as JSON.
import { CUSTOM_TAG, type CatalogEntry, type PresetData } from '../../shared/types';

// Default JSON template shown in the textarea when adding a new preset.
export const EMPTY_PRESET_TEMPLATE = `{
  "name": "",
  "description": "",
  "tags": [],
  "duration": 0,
  "discretePattern": [
    { "time": 0, "amplitude": 0, "frequency": 0 }
  ],
  "continuousPattern": {
    "amplitude": [],
    "frequency": []
  }
}`;

// Parse + validate a JSON config. Throws an Error with a friendly message on
// invalid input. The CUSTOM_TAG is always present in the returned tags.
export function parseCustomPresetJson(json: string): PresetData {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    throw new Error('Not valid JSON.');
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Expected a JSON object.');
  }
  const o = raw as Record<string, unknown>;

  const name = typeof o.name === 'string' ? o.name.trim() : '';
  if (!name) throw new Error('Missing required "name".');

  const discretePattern = Array.isArray(o.discretePattern) ? o.discretePattern : [];
  const c = (o.continuousPattern ?? {}) as Record<string, unknown>;
  const continuousPattern = {
    amplitude: Array.isArray(c.amplitude) ? c.amplitude : [],
    frequency: Array.isArray(c.frequency) ? c.frequency : []
  };
  if (discretePattern.length === 0 && continuousPattern.amplitude.length === 0) {
    throw new Error('Provide non-empty "discretePattern" or "continuousPattern.amplitude".');
  }

  const tags = Array.isArray(o.tags)
    ? ((o.tags as unknown[]).filter((t) => typeof t === 'string') as string[])
    : [];
  const tagsWithCustom = tags.includes(CUSTOM_TAG) ? tags : [...tags, CUSTOM_TAG];

  return {
    name,
    description: typeof o.description === 'string' ? o.description : '',
    tags: tagsWithCustom,
    duration: typeof o.duration === 'number' ? o.duration : 0,
    discretePattern: discretePattern as PresetData['discretePattern'],
    continuousPattern: continuousPattern as PresetData['continuousPattern']
  };
}

// Build a CatalogEntry from PresetData, preserving an id when editing.
export function makeEntry(data: PresetData, existingId?: string): CatalogEntry {
  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const id = existingId ?? `custom-${slug || 'preset'}-${Date.now()}`;
  return { id, category: 'custom', platform: null, data };
}

export const stringifyPreset = (data: PresetData): string => JSON.stringify(data, null, 2);
