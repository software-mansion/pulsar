import { defineConfig } from 'vite'
import { resolve } from 'path'

// Separate config for the React adapter — emits ESM + CJS only.
// React users always go through a bundler, so UMD/IIFE aren't needed here.
export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/react/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => format === 'es' ? 'react.es.js' : 'react.cjs'
    },
    sourcemap: true,
    minify: true,
    target: 'es2020',
    rollupOptions: {
      external: ['react', 'react/jsx-runtime'],
      output: {
        exports: 'named'
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
