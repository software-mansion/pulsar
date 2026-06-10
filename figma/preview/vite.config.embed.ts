import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Single-file build of the live-preview app, used to embed the whole UI inside
// the docs site at docs/src/pages/figma-preview.astro.
//
// Output is one self-contained HTML at dist-embed/index.html with every JS/CSS
// chunk + every static asset inlined as data URI. The docs build copies this
// file into docs/src/components/preview/embed.html and the Preview.astro
// component renders it inside an <iframe srcdoc>.
//
// `npm run build` (the standalone deploy target) is untouched — it keeps using
// vite.config.ts to ship the regular multi-file build to
// https://docs.swmansion.com/figma-preview/.
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'dist-embed',
    emptyOutDir: true,
    target: 'es2020',
    cssCodeSplit: false,
    // Generous limit so every asset gets inlined as a data URI — the docs
    // embed depends on the bundle being a single file with no sidecars.
    assetsInlineLimit: 100_000_000
  }
});
