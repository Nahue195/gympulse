import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Charts library (heavy)
          'vendor-charts': ['recharts'],
          // Supabase
          'vendor-supabase': ['@supabase/supabase-js'],
          // Date utilities
          'vendor-date': ['date-fns'],
        },
      },
    },
    // Increase chunk size warning limit slightly since we're code splitting
    chunkSizeWarningLimit: 600,
  },
})
