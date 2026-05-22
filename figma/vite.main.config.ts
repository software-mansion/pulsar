import { defineConfig } from 'vite';
import { resolve } from 'path';

// Main-thread (figma sandbox) bundle. No DOM, no React.
export default defineConfig({
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: false,
    target: 'es2017',
    lib: {
      entry: resolve(__dirname, 'src/main/code.ts'),
      formats: ['iife'],
      name: 'PulsarPlugin',
      fileName: () => 'code.js'
    },
    rollupOptions: {
      output: { extend: true, inlineDynamicImports: true }
    }
  }
});
