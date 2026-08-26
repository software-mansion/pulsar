import { PatternComposer, Preset, RealtimeComposer, Settings } from 'pulsar-haptics';
import type { HapticPattern } from 'pulsar-haptics';

/**
 * Every screen plays haptics through this module so that starting a new effect
 * always silences the previous one — the mobile app gets that for free from the
 * native engine, the Web Vibration API does not.
 */

let currentPreset: Preset | null = null;

const SOUND_KEY = 'pulsar_web_app_sound_enabled';

export function isHapticsAvailable(): boolean {
  return Settings.isHapticsAvailable();
}

export function isSoundEnabled(): boolean {
  if (typeof localStorage === 'undefined') return true;
  return localStorage.getItem(SOUND_KEY) !== 'false';
}

export function setSoundEnabled(enabled: boolean) {
  Settings.enableSound(enabled);
  try {
    localStorage.setItem(SOUND_KEY, String(enabled));
  } catch {
    // Private-mode browsers throw on write; the in-memory setting still applies.
  }
}

// Apply the persisted preference before anything plays.
Settings.enableSound(isSoundEnabled());

/**
 * Plays a full pattern. On devices without the Vibration API (most desktops)
 * `Preset` renders the pattern to audio instead, so the effect is still
 * perceivable — that fallback is why presets go through `Preset` and not
 * through a bare `PatternComposer`.
 */
export function playPattern(name: string, pattern: HapticPattern): Preset {
  stopPattern();
  const preset = new Preset(name, pattern);
  currentPreset = preset;
  void preset.play();
  return preset;
}

export function stopPattern() {
  currentPreset?.stop();
  currentPreset = null;
  Settings.stopHaptics();
}

/**
 * Fire-and-forget one-shot used for UI feedback (button presses, ticks). Kept
 * separate from `playPattern` so it never cancels a preset the user is
 * listening to, and so it stays silent rather than beeping on desktop.
 */
export function playCue(pattern: HapticPattern) {
  const composer = new PatternComposer();
  composer.parse(pattern);
  composer.play();
}

/** Short tap used by buttons and tab switches, mirroring the app's `impactLight`. */
export function playTapCue() {
  playCue([{ type: 'pulse', timestamp: 0, duration: 30, intensity: 0.5, frequency: 0.6 }]);
}

export const realtimeComposer = new RealtimeComposer();

/** Compiles a pattern to its on/off Vibration API timeline, for visualisation. */
export function toTimeline(pattern: HapticPattern): number[] {
  return new PatternComposer().parse(pattern);
}
