import { TurboModuleRegistry, type TurboModule } from 'react-native';

type Pattern = {
  discretePattern: { time: number, amplitude: number, frequency: number }[],
  continuesPattern: {
    amplitude: { time: number, value: number }[],
    frequency: { time: number, value: number }[],
  }
}

enum HapticSupport {
  NO_SUPPORT = 0,
  MINIMAL_SUPPORT = 1,
  LIMITED_SUPPORT = 2,
  STANDARD_SUPPORT = 3,
  ADVANCED_SUPPORT = 4,
}

export interface Spec extends TurboModule {
  Pulsar_play(name: string): void;
  Pulsar_enableSound(state: boolean): void;
  Pulsar_enableCache(state: boolean): void;
  Pulsar_clearCache(state: boolean): void;
  Pulsar_preloadPresets(presetNames: Array<String>): void;
  Pulsar_hapticSupport(): HapticSupport;

  RealtimeComposer_update(amplitude: number, frequency: number): void;
  RealtimeComposer_stop(): void;
  RealtimeComposer_isActive(): boolean;
  RealtimeComposer_playDiscrete(amplitude: number, frequency: number): void;

  PatternComposer_parsePattern(data: Pattern): number;
  PatternComposer_play(patternId: number): void;
  PatternComposer_release(patternId: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNPulsar');
