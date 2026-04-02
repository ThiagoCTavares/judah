import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      includeAssets: ['Logo.svg', 'apple-touch-icon.png'],
      workbox: {
        // Evita falha intermitente do terser na etapa de generateSW.
        mode: 'development',
        // O bundle principal hoje passa de 2 MiB por causa do catálogo completo de ícones.
        // Sem aumentar esse limite, o build PWA falha ao gerar o precache.
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
      },
      manifest: {
        name: 'Judah',
        short_name: 'Judah',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
})
