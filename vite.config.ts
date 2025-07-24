import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react'],
          'sample-data': ['./src/utils/sampleData.ts']
        }
      }
    },
    // Increase chunk size warning limit to 1MB since this is a complete tournament management system
    chunkSizeWarningLimit: 1000
  }
})
