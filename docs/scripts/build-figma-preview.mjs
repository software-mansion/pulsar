#!/usr/bin/env node
// Regenerate the standalone live-preview embed used on the docs /figma-preview
// page.
//
// The preview app source lives in the *private* repo at
// `pulsar-private/figma/preview` (checked out side-by-side with this repo). This
// script builds it in single-file mode and copies the resulting HTML into
// `docs/src/components/preview/embed.html`, which IS committed to this public
// repo. Preview.astro imports that file as `?raw` and embeds it via
// <iframe srcdoc> on the /figma-preview page.
//
// Because the built `embed.html` is committed, the public docs build
// (`npm run build`) needs neither the private source nor this script — it just
// uses the committed artifact. This script is therefore NOT part of `build`;
// run it manually (`npm run sync:preview`) whenever the private preview source
// changes, then commit the updated `embed.html`.
//
// If the private repo is not present (external contributor, public CI), this
// script exits 0 without touching anything, so it is always safe to invoke.

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, copyFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DOCS_ROOT = resolve(__dirname, '..');
const PREVIEW_ROOT = resolve(DOCS_ROOT, '../pulsar-private/figma/preview');
const PREVIEW_OUTPUT = resolve(PREVIEW_ROOT, 'dist-embed/index.html');
const EMBED_DEST = resolve(DOCS_ROOT, 'src/components/preview/embed.html');

if (!existsSync(PREVIEW_ROOT)) {
  console.log(
    `[figma-preview] private preview source not found at ${PREVIEW_ROOT} — ` +
      'skipping (the committed embed.html will be used as-is).'
  );
  process.exit(0);
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
console.log('[figma-preview] done — commit the updated embed.html to publish it.');
