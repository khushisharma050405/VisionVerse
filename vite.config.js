import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/generate-caption': 'http://127.0.0.1:8001',
      '/caption': 'http://127.0.0.1:8001'
    }
  }
})
