// Portable programmatic API (no Node APIs) — safe to import from Studio's browser bundle.
// For reading .pulsar files from disk, import from './read.ts' (Node-only) instead.

export * from './types.ts';
export { validateManifest } from './validate.ts';
export { generate, TARGETS } from './generate.ts';
export { emitSwift } from './emit/swift.ts';
export { emitKotlin } from './emit/kotlin.ts';
export { emitDart } from './emit/dart.ts';
export { emitRn, buildSidecar, SIDECAR_SCHEMA } from './emit/rn.ts';
export type { BundleSidecar, PresetSidecarEntry } from './emit/rn.ts';
export { extractPatterns, extractAnimations } from './patterns.ts';
export type { EntryMap } from './patterns.ts';
export {
  isValidPresetId,
  assertValidPresetId,
  pascalCase,
  lowerCamel,
  snakeCase,
} from './naming.ts';
