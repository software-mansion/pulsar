import { useCallback, useEffect } from 'react';
import Pulsar from './NativeRNPulsar';

// workaround for RN prototype caching issue
Pulsar.RealtimeComposer_set;
Pulsar.RealtimeComposer_playDiscrete;
Pulsar.RealtimeComposer_stop;
Pulsar.RealtimeComposer_isActive;
Pulsar.RealtimeComposer_reset;

export type RealtimeComposer = {
  set: (amplitude: number, frequency: number) => void;
  playDiscrete: (amplitude: number, frequency: number) => void;
  stop: () => void;
  isActive: () => boolean;
  /**
   * Clear the native composer's sticky stopped-latch. The composer is a
   * shared singleton across all hook instances, so a screen that left the
   * stack via `Settings.stopHaptics` / `composer.stop` would leave the next
   * screen unable to play haptics until it calls `reset`. Mount-time reset
   * here makes that automatic; screen-level focus hooks may also call this.
   */
  reset: () => void;
};

export default function useRealtimeComposer(): RealtimeComposer {
  const set = useCallback((amplitude: number, frequency: number) => {
    'worklet';
    Pulsar.RealtimeComposer_set(amplitude, frequency);
  }, []);

  const playDiscrete = useCallback((amplitude: number, frequency: number) => {
    'worklet';
    Pulsar.RealtimeComposer_playDiscrete(amplitude, frequency);
  }, []);

  const stop = useCallback(() => {
    'worklet';
    Pulsar.RealtimeComposer_stop();
  }, []);

  const isActive = useCallback(() => {
    'worklet';
    return Pulsar.RealtimeComposer_isActive();
  }, []);

  const reset = useCallback(() => {
    'worklet';
    Pulsar.RealtimeComposer_reset();
  }, []);

  // Clear the latch on mount (the composer is a process-wide singleton that
  // may have been latched off by a previously-popped screen) and re-stop on
  // unmount.
  useEffect(() => {
    reset();
    return stop;
  }, [reset, stop]);

  return { set, playDiscrete, stop, isActive, reset };
}
