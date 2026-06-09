#!/usr/bin/env node
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(import.meta.url), '..', '..', 'dist');
const importRegex = /(from\s+["'])(\.\.?\/[^"']+?)\.ts(["'])/g;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
    } else if (entry.name.endsWith('.d.ts')) {
      const content = await readFile(full, 'utf8');
      const next = content.replace(importRegex, '$1$2.js$3');
      if (next !== content) {
        await writeFile(full, next);
      }
    }
  }
}

await walk(root);
console.log('Rewrote .ts → .js in declaration files under', root);
