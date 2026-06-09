import Pulsar from "pulsar-haptics";

// One shared Pulsar instance. The presets and realtime composer are stateful
// (shared instances), so we want a single owner across the whole React tree.
export const pulsar = new Pulsar();
export const presets = pulsar.getPresets();
export const realtime = pulsar.getRealtimeComposer();
export const patternComposer = pulsar.getPatternComposer();
