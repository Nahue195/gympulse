import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png', 'favicon-64.png'],
      manifest: {
        name: 'GymPulse',
        short_name: 'GymPulse',
        description: 'Tracking de entrenamientos, medidas, nutrición y comunidad fitness.',
        lang: 'es',
        theme_color: '#07070A',
        background_color: '#07070A',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precachea el app-shell (JS/CSS/HTML/íconos) para carga offline.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Fallback de navegación al index cacheado cuando no hay red.
        navigateFallback: '/index.html',
        // No cachear llamadas a Supabase (auth/datos): quedan network-only.
        navigateFallbackDenylist: [/^\/api/, /supabase/],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
  },
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
