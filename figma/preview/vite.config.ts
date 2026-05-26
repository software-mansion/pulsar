import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Standalone live-preview web app. Deployed independently of the Figma plugin.
// base: './' keeps asset paths relative so it can be hosted under any subpath
// (e.g. https://docs.swmansion.com/figma-preview/).
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5173, strictPort: true },
  build: { outDir: 'dist', emptyOutDir: true, target: 'es2020' }
});
