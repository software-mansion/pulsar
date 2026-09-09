import Pulsar from './NativeRNPulsar';
import type { PresetName } from './presetNames';

// workaround for RN prototype caching issue
Pulsar.Pulsar_play;

export default {
  playByName: (name: PresetName) => {
    'worklet';
    Pulsar.Pulsar_play(name);
  },
};
