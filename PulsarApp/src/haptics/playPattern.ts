import { Presets } from 'react-native-pulsar';

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
