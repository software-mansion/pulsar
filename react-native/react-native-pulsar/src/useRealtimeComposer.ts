import { useCallback, useEffect } from 'react';
import Pulsar from './NativeRNPulsar';

// workaround for RN prototype caching issue 
Pulsar.RealtimeComposer_update;
Pulsar.RealtimeComposer_playDiscrete;
Pulsar.RealtimeComposer_stop;
Pulsar.RealtimeComposer_isActive;

export type RealtimeComposer = {
  update: (amplitude: number, frequency: number) => void;
  playDiscrete: (amplitude: number, frequency: number) => void;
  stop: () => void;
  isActive: () => boolean;
};

export default function useRealtimeComposer(): RealtimeComposer {
  const update = useCallback((amplitude: number, frequency: number) => {
    'worklet';
    Pulsar.RealtimeComposer_update(amplitude, frequency);
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

  return { update, playDiscrete, stop, isActive };
}
