import { Presets, usePatternComposer, type Pattern } from 'react-native-pulsar';

// Resolve a pattern name (as sent by the haptics socket peer or the Figma
// preview WebView) to the corresponding Presets function, then invoke it.
// Returns true when a matching preset was found and played, false otherwise.
//
// Lifted out of app/(tabs)/index.tsx so the Figma WebView screen can reuse the
// same name → preset mapping without duplicating it.
export function playPattern(patternName: string): boolean {
  if (patternName.includes('System')) {
    const key = patternName.replace('System', '').replace('Preset', '');
    const normalizedKey = `${key.charAt(0).toLowerCase()}${key.slice(1)}`;
    const systemPreset =
      (Presets.System as any)[normalizedKey] ?? (Presets.System as any)[key];
    if (typeof systemPreset === 'function') {
      systemPreset();
      return true;
    }
    const androidPreset =
      (Presets.System.Android as any)[normalizedKey] ??
      (Presets.System.Android as any)[key];
    if (typeof androidPreset === 'function') {
      androidPreset();
      return true;
    }
    return false;
  }
  const normalizedName = `${patternName.charAt(0).toLowerCase()}${patternName.slice(1)}`;
  const preset = (Presets as any)[patternName] ?? (Presets as any)[normalizedName];
  if (typeof preset === 'function') {
    preset();
    return true;
  }
  return false;
}

// Hook variant that plays an arbitrary pattern via react-native-pulsar's
// PatternComposer. Used by the Figma WebView screen for custom (user-defined)
// presets whose names aren't in Presets. Returns a single function that:
//   1. Tries the built-in by name (no parsing involved → cheapest).
//   2. Falls through to parse() + play() on the supplied Pattern.
// The composer is shared across calls — `parse()` retargets it to a new pattern,
// and the prior pattern id is released by the hook on unmount.
export function usePlayPatternFromHost(): (name: string, pattern?: Pattern) => boolean {
  const composer = usePatternComposer(undefined);

  return (name, pattern) => {
    if (playPattern(name)) return true;
    if (!pattern) return false;
    // parse() is synchronous and immediately publishes the new patternId into
    // the hook's shareable state, so the play() call right after picks it up.
    composer.parse(pattern);
    composer.play();
    return true;
  };
}
