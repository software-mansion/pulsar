import { readFileSync } from 'fs';
import { join } from 'path';

const read = (file: string) =>
  readFileSync(join(__dirname, '..', file), 'utf8');

const namesPlayedByPresets = () =>
  new Set(
    Array.from(
      read('Presets.ts').matchAll(/Pulsar_play\('([^']+)'\)/g),
      (match) => match[1]
    )
  );

const namesInPresetNameUnion = () =>
  new Set(
    Array.from(
      read('presetNames.ts').matchAll(/^\s*\| '([^']+)'/gm),
      (match) => match[1]
    )
  );

describe('PresetName', () => {
  it('covers every preset reachable through Presets', () => {
    const played = namesPlayedByPresets();
    const declared = namesInPresetNameUnion();

    expect(played.size).toBeGreaterThan(0);
    expect([...played].filter((name) => !declared.has(name))).toEqual([]);
  });

  it('declares no name that Presets cannot play', () => {
    const played = namesPlayedByPresets();
    const declared = namesInPresetNameUnion();

    expect([...declared].filter((name) => !played.has(name))).toEqual([]);
  });
});
