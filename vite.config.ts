import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  // Use the repository name as base path in production so assets resolve on GitHub Pages.
  base: process.env.NODE_ENV === 'production' ? '/sellyx-front/' : '/',
  plugins: [vue()],
})
