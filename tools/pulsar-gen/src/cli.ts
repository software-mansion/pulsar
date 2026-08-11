#!/usr/bin/env node
// pulsar-gen — generate typed accessors for a .pulsar bundle.
//
//   pulsar-gen <bundle.pulsar> --target swift,kotlin,dart,rn [--out DIR] [--package PKG] [--asset NAME]
//
// Emits one file per target. Targets: swift | kotlin | dart | rn (comma-separated or repeated).

import { parseArgs } from 'node:util';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { readBundleFile } from './read.ts';
import { generate, TARGETS } from './generate.ts';
import type { Target, GenerateOptions } from './types.ts';

function usage(): never {
  process.stderr.write(
    'Usage: pulsar-gen <bundle.pulsar> --target <swift,kotlin,dart,rn> [--out DIR] ' +
      '[--package PKG] [--asset NAME] [--stdout]\n',
  );
  process.exit(2);
}

function main(argv: string[]): void {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        target: { type: 'string', multiple: true, short: 't' },
        out: { type: 'string', short: 'o' },
        package: { type: 'string', short: 'p' },
        asset: { type: 'string' },
        stdout: { type: 'boolean' },
        help: { type: 'boolean', short: 'h' },
      },
    });
  } catch (e) {
    process.stderr.write(`${(e as Error).message}\n`);
    return usage();
  }

  if (parsed.values.help || parsed.positionals.length !== 1) return usage();

  const bundlePath = parsed.positionals[0];
  const rawTargets = (parsed.values.target ?? []).flatMap((t) => t.split(','));
  if (rawTargets.length === 0) {
    process.stderr.write('error: at least one --target is required\n');
    return usage();
  }
  const targets = rawTargets.map((t) => t.trim()) as Target[];
  for (const t of targets) {
    if (!TARGETS.includes(t)) {
      process.stderr.write(`error: unknown target "${t}" (expected ${TARGETS.join(', ')})\n`);
      process.exit(2);
    }
  }

  const { manifest } = readBundleFile(bundlePath);
  const opts: GenerateOptions = {
    assetName: parsed.values.asset ?? basename(bundlePath).replace(/\.pulsar$/i, ''),
    packageName: parsed.values.package,
  };

  const outDir = parsed.values.out ?? '.';
  if (!parsed.values.stdout) mkdirSync(outDir, { recursive: true });

  for (const target of targets) {
    const file = generate(manifest, target, opts);
    if (parsed.values.stdout) {
      process.stdout.write(file.content);
    } else {
      const dest = join(outDir, file.filename);
      writeFileSync(dest, file.content);
      process.stderr.write(`pulsar-gen: wrote ${dest}\n`);
    }
  }
}

main(process.argv.slice(2));
