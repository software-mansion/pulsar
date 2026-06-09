import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PatternComposer } from "../PatternComposer.ts";
import { Presets, type PresetName, type PresetPlaybackResult } from "../Presets.ts";
import Pulsar from "../Pulsar.ts";
import { RealtimeComposer } from "../RealtimeComposer.ts";
import Settings from "../Settings.ts";
import type { HapticPattern } from "../types.ts";

let sharedPulsar: Pulsar | null = null;

function getSharedPulsar(): Pulsar {
  if (sharedPulsar === null) {
    sharedPulsar = new Pulsar();
  }
  return sharedPulsar;
}

/**
 * Returns the shared Pulsar instance. Cheap, safe to call from any component.
 */
export function useHaptics(): Pulsar {
  return useMemo(getSharedPulsar, []);
}

/**
 * Returns the shared Presets registry. Use `presets.play('tap')` to fire a built-in pattern.
 */
export function usePresets(): Presets {
  return useHaptics().getPresets();
}

/**
 * Returns a stable callback that plays the given preset by name.
 *
 * @example
 *   const playTap = usePreset('tap');
 *   <button onClick={playTap}>Tap</button>
 */
export function usePreset(name: PresetName): () => Promise<PresetPlaybackResult> {
  const presets = usePresets();
  return useCallback(() => presets.play(name), [presets, name]);
}

/**
 * Reports whether the Web Vibration API is available in the current environment.
 *
 * Returns `false` during SSR and on the first client render, then flips to the
 * real value after mount — safe for hydration.
 */
export function useHapticsSupport(): boolean {
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    setSupported(Settings.isHapticsAvailable());
  }, []);
  return supported;
}

export type PatternComposerHandle = {
  play: () => boolean;
  stop: () => boolean;
  parse: (pattern: HapticPattern) => number[];
  getPattern: () => number[];
  isParsed: () => boolean;
};

/**
 * Owns a PatternComposer for the component's lifetime. Pass a `pattern` to
 * auto-parse on mount and re-parse whenever it changes; or omit and call
 * `parse()` manually.
 *
 * The composer is stopped automatically on unmount.
 */
export function usePatternComposer(pattern?: HapticPattern): PatternComposerHandle {
  const composerRef = useRef<PatternComposer | null>(null);
  if (composerRef.current === null) {
    composerRef.current = new PatternComposer();
  }
  const composer = composerRef.current;
  const parsedRef = useRef(false);

  const play = useCallback(() => composer.play(), [composer]);
  const stop = useCallback(() => composer.stop(), [composer]);
  const parse = useCallback(
    (next: HapticPattern) => {
      parsedRef.current = true;
      return composer.parse(next);
    },
    [composer],
  );
  const getPattern = useCallback(() => composer.getPattern(), [composer]);
  const isParsed = useCallback(() => parsedRef.current, []);

  useEffect(() => {
    if (pattern) {
      parse(pattern);
    }
    return () => {
      composer.stop();
    };
  }, [pattern, parse, composer]);

  return { play, stop, parse, getPattern, isParsed };
}

export type RealtimeComposerHandle = {
  set: (intensity: number, frequency: number) => boolean;
  stop: () => boolean;
  isPlaying: () => boolean;
  getCurrentValues: () => { intensity: number; frequency: number };
};

/**
 * Owns a RealtimeComposer for the component's lifetime. Call `set(intensity, frequency)`
 * on every gesture update; the underlying loop is started lazily and stopped on unmount.
 */
export function useRealtimeComposer(): RealtimeComposerHandle {
  const composerRef = useRef<RealtimeComposer | null>(null);
  if (composerRef.current === null) {
    composerRef.current = new RealtimeComposer();
  }
  const composer = composerRef.current;

  const set = useCallback(
    (intensity: number, frequency: number) => composer.set(intensity, frequency),
    [composer],
  );
  const stop = useCallback(() => composer.stop(), [composer]);
  const isPlaying = useCallback(() => composer.isPlaying(), [composer]);
  const getCurrentValues = useCallback(() => composer.getCurrentValues(), [composer]);

  useEffect(
    () => () => {
      composer.stop();
    },
    [composer],
  );

  return { set, stop, isPlaying, getCurrentValues };
}

export { PatternComposer, Presets, Pulsar, RealtimeComposer, Settings };
export type { HapticPattern, PresetName, PresetPlaybackResult };
