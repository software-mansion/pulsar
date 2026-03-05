import Presets from './Presets';
import Settings from './Settings';
import useRealtimeComposer from './useRealtimeComposer';
import usePatternComposer from './usePatternComposer';

const useHapticsComposer = usePatternComposer;

export { 
  Presets,
  Settings,
  useRealtimeComposer,
  usePatternComposer,
  useHapticsComposer,
};

export type { Pattern, PatternComposer } from './types';
export { HapticSupport } from './NativeRNPulsar';
export type { RealtimeComposer } from './useRealtimeComposer';
