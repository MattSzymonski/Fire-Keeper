import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  server: {
    host: true, // Accept connections from host
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // Required for file watching in some Docker setups
    },
    allowedHosts: ['home.campfire-on-the-wall.com'],
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Inside container
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  },
})
