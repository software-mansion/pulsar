#!/usr/bin/env node
// Build the standalone figma-preview app (figma/preview) in single-file mode
// and copy the resulting HTML into docs/src/components/preview/embed.html.
//
// This runs as part of `npm run build` in docs/ so the embedded preview is
// always rebuilt against the latest source — no manual sync between the two
// projects. The Preview.astro component imports the copied file as `?raw`
// and embeds it via <iframe srcdoc> on the /figma-preview page.

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, copyFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DOCS_ROOT = resolve(__dirname, '..');
const PREVIEW_ROOT = resolve(DOCS_ROOT, '../figma/preview');
const PREVIEW_OUTPUT = resolve(PREVIEW_ROOT, 'dist-embed/index.html');
const EMBED_DEST = resolve(DOCS_ROOT, 'src/components/preview/embed.html');

if (!existsSync(PREVIEW_ROOT)) {
  console.error(`[figma-preview] not found at ${PREVIEW_ROOT}`);
  process.exit(1);
}
if (!existsSync(resolve(PREVIEW_ROOT, 'node_modules'))) {
  console.error(
    `[figma-preview] node_modules missing — run \`npm --prefix ${PREVIEW_ROOT} install\` first`
  );
  process.exit(1);
}

console.log('[figma-preview] building embed bundle…');
try {
  execSync('npm run build:embed', { cwd: PREVIEW_ROOT, stdio: 'inherit' });
} catch (err) {
  console.error('[figma-preview] embed build failed');
  process.exit(1);
}

if (!existsSync(PREVIEW_OUTPUT)) {
  console.error(`[figma-preview] expected output not found at ${PREVIEW_OUTPUT}`);
  process.exit(1);
}

mkdirSync(dirname(EMBED_DEST), { recursive: true });
copyFileSync(PREVIEW_OUTPUT, EMBED_DEST);
const { size } = statSync(EMBED_DEST);
console.log(`[figma-preview] copied → ${EMBED_DEST} (${(size / 1024).toFixed(1)} kB)`);
