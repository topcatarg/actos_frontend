import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    // En dev todo /api va al backend: sin CORS y sin URLs hardcodeadas en el código
    proxy: {
      '/api': { target: 'http://localhost:5063', changeOrigin: true },
    },
  },
})
