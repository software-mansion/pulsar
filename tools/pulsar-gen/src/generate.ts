// Target dispatch (portable — no Node APIs). Reused by the CLI and by Studio's browser exporter.

import type { BundleManifest, GenerateOptions, GeneratedFile, Target } from './types.ts';
import { emitSwift } from './emit/swift.ts';
import { emitKotlin } from './emit/kotlin.ts';
import { emitDart } from './emit/dart.ts';
import { emitRn } from './emit/rn.ts';

export const TARGETS: Target[] = ['swift', 'kotlin', 'dart', 'rn'];

export function generate(
  manifest: BundleManifest,
  target: Target,
  opts: GenerateOptions = {},
): GeneratedFile {
  switch (target) {
    case 'swift':
      return emitSwift(manifest, opts);
    case 'kotlin':
      return emitKotlin(manifest, opts);
    case 'dart':
      return emitDart(manifest, opts);
    case 'rn':
      return emitRn(manifest, opts);
    default:
      throw new Error(`Unknown target "${target as string}". Expected one of: ${TARGETS.join(', ')}`);
  }
}
