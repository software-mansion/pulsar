import { useCallback, useEffect } from 'react';
import Pulsar from './NativeRNPulsar';

// workaround for RN prototype caching issue
Pulsar.RealtimeComposer_start;
Pulsar.RealtimeComposer_set;
Pulsar.RealtimeComposer_playDiscrete;
Pulsar.RealtimeComposer_stop;
Pulsar.RealtimeComposer_isActive;

export type RealtimeComposer = {
  start: () => void;
  set: (amplitude: number, frequency: number, startIfNeeded?: boolean) => void;
  playDiscrete: (amplitude: number, frequency: number) => void;
  stop: () => void;
  isActive: () => boolean;
};

export default function useRealtimeComposer(): RealtimeComposer {
  const start = useCallback(() => {
    'worklet';
    Pulsar.RealtimeComposer_start();
  }, []);

  const set = useCallback((amplitude: number, frequency: number, startIfNeeded: boolean = false) => {
    'worklet';
    Pulsar.RealtimeComposer_set(amplitude, frequency, startIfNeeded);
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

  useEffect(() => stop, [stop]);

  return { start, set, playDiscrete, stop, isActive };
}
