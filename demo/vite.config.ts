import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const typeflowSrc = fileURLToPath(new URL('../packages/typeflow/src', import.meta.url))

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [vue()],
  resolve: {
    alias: [
      { find: 'typeflow/style.css', replacement: `${typeflowSrc}/style.css` },
      { find: 'typeflow/presets/blueprint', replacement: `${typeflowSrc}/presets/blueprint/index.ts` },
      { find: 'typeflow/core', replacement: `${typeflowSrc}/core/index.ts` },
      { find: 'typeflow/theme', replacement: `${typeflowSrc}/theme/index.ts` },
      { find: 'typeflow/vue', replacement: `${typeflowSrc}/vue/index.ts` },
      { find: 'typeflow', replacement: `${typeflowSrc}/index.ts` },
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
    ],
    dedupe: ['vue', '@vue-flow/core', '@vue-flow/background'],
  },
  server: {
    fs: { allow: [root] },
  },
  build: {
    outDir: fileURLToPath(new URL('../dist/demo', import.meta.url)),
    emptyOutDir: true,
  },
})
