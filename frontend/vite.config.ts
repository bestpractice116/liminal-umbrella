import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/oauth/authorize': 'http://127.0.0.1:8080',
      '/oauth/callback': 'http://127.0.0.1:8080',
      '/oauth/refreshtoken': 'http://127.0.0.1:8080',
      '/oauth/logout': 'http://127.0.0.1:8080',
    }
  }
})
