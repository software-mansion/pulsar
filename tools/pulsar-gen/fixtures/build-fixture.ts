// Regenerates the committed fixture bundle and its golden generated outputs.
//   node fixtures/build-fixture.ts

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildFixtureBundle } from './fixture.ts';
import { readBundleBytes } from '../src/read.ts';
import { generate, TARGETS } from '../src/generate.ts';

const here = dirname(fileURLToPath(import.meta.url));
const goldenDir = join(here, 'golden');
mkdirSync(goldenDir, { recursive: true });

const bytes = buildFixtureBundle();
writeFileSync(join(here, 'acme-pack.pulsar'), bytes);

const { manifest } = readBundleBytes(bytes);
for (const target of TARGETS) {
  const file = generate(manifest, target, { assetName: 'acme-pack' });
  writeFileSync(join(goldenDir, file.filename), file.content);
  process.stderr.write(`built golden ${target}: ${file.filename}\n`);
}
process.stderr.write('fixture + goldens updated\n');
