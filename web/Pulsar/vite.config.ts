import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Pulsar',
      formats: ['es', 'cjs', 'umd', 'iife'],
      fileName: (format) => {
        switch (format) {
          case 'es': return 'haptics.es.js'
          case 'cjs': return 'haptics.cjs'
          case 'umd': return 'haptics.umd.js'
          case 'iife': return 'haptics.iife.js'
          default: return `haptics.${format}.js`
        }
      }
    },
    sourcemap: true,
    minify: true,
    target: 'es2020',
    rollupOptions: {
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
