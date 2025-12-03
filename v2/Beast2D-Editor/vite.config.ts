import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Alias to reference the engine source from the sibling Beast2D project
      'beast2d': fileURLToPath(new URL('../Beast2D/src', import.meta.url)),
    },
  },
  server: {
    fs: {
      // Allow serving files from the editor root and sibling Beast2D directory
      allow: [
        fileURLToPath(new URL('.', import.meta.url)),
        fileURLToPath(new URL('../Beast2D', import.meta.url)),
      ]
    }
  }
})
