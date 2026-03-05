import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Haptics',
      formats: ['umd', 'es'],
      fileName: (format) => {
        if (format === 'umd') {
          return 'haptics.umd.js'
        }
        return 'haptics.es.js'
      }
    },
    sourcemap: true,
    minify: true,
    target: 'ESNext',
    rollupOptions: {
      output: {
        exports: 'named',
        globals: {
          tslib: 'tslib'
        }
      },
      external: ['tslib']
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
