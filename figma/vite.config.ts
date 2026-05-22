import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { resolve } from 'path';
import { renameSync, existsSync } from 'fs';

// UI bundle: React app inlined into a single ui.html for the Figma plugin iframe.
export default defineConfig({
  root: 'src/ui',
  plugins: [
    react(),
    viteSingleFile(),
    {
      name: 'rename-index-to-ui',
      closeBundle() {
        const from = resolve(__dirname, 'dist/index.html');
        const to = resolve(__dirname, 'dist/ui.html');
        if (existsSync(from)) renameSync(from, to);
      }
    }
  ],
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: false,
    target: 'es2020',
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000
  }
});
