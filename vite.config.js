import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'LuxStay Hotels',
        short_name: 'LuxStay',
        description: 'Hotel booking made easy',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2b2b2b',
        orientation: 'portrait',
        icons: [
          {
            src:     "https://mpjourney.s3.amazonaws.com/uploads/UBhHLBQIyb7VM7w9KCAgxgavuEpu09SfObZozGtw.png",
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src:     "https://mpjourney.s3.amazonaws.com/uploads/UBhHLBQIyb7VM7w9KCAgxgavuEpu09SfObZozGtw.png",
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src:     "https://mpjourney.s3.amazonaws.com/uploads/UBhHLBQIyb7VM7w9KCAgxgavuEpu09SfObZozGtw.png",
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})
