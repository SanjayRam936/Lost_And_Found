import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev proxy so the React app can call Django on :8000 without CORS.
// Frontend calls /api/... and /media/...; Vite forwards them to Django.
const BACKEND = 'http://127.0.0.1:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: BACKEND, changeOrigin: true },
      '/media': { target: BACKEND, changeOrigin: true },
      '/ws': { target: BACKEND, ws: true, changeOrigin: true },
    },
  },
})
