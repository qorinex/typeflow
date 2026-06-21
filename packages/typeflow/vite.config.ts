import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

const src = fileURLToPath(new URL('./src', import.meta.url))

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      preserveEntrySignatures: 'strict',
      input: {
        index: `${src}/index.ts`,
        'core/index': `${src}/core/index.ts`,
        'theme/index': `${src}/theme/index.ts`,
        'vue/index': `${src}/vue/index.ts`,
        'typeRegistry/index': `${src}/typeRegistry/index.ts`,
        'presets/blueprint/index': `${src}/presets/blueprint/index.ts`,
        style: `${src}/style.css`,
      },
      external: ['vue', '@vue-flow/core'],
      output: {
        format: 'es',
        entryFileNames: '[name].js',
        chunkFileNames: '_chunks/[name]-[hash].js',
        assetFileNames: (assetInfo) =>
          assetInfo.name === 'style.css' ? 'style.css' : 'assets/[name]-[hash][extname]',
      },
    },
  },
})
