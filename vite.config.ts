import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  root: './client',
  build: {
    outDir: '../build/front',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './client/src/'),
      '@shared': resolve(__dirname, './shared'),
      '@assets': resolve(__dirname, './client/assets')
    }
  }
}) 