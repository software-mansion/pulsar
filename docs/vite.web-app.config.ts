import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { BASE_PATH } from './config.ts';

/**
 * The Pulsar Web App is a standalone Vite bundle that ships *with* the docs but
 * is deliberately not part of the Astro bundle: nothing of it is downloaded
 * until someone opens /pulsar/web-app/.
 *
 * It builds into `public/web-app/`, which `astro build` then copies verbatim
 * into `dist/`. Run it via `npm run build:web-app` (the docs `dev` and `build`
 * scripts both do this for you).
 */
export default defineConfig({
  root: 'web-app',
  base: `${BASE_PATH}/web-app/`,
  plugins: [react()],
  server: {
    fs: {
      // Presets (JSON + waveform PNGs) live in the Astro asset tree and are
      // shared with the docs' own web presets playground.
      allow: ['..'],
    },
  },
  build: {
    outDir: '../public/web-app',
    emptyOutDir: true,
    // Waveform PNGs are lazy-loaded inside preset cards; inlining the small
    // ones as base64 would bloat the (barely compressible) entry chunk instead.
    assetsInlineLimit: 0,
  },
});
