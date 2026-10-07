import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: [
        'brand/hg-industrial.svg',
        'icons/hg.svg',
        'icons/hg-192.png',
        'icons/hg-512.png',
      ],
      manifest: {
        name: 'HG Industrial · Totem E1',
        short_name: 'HG Totem',
        lang: 'pt-BR',
        description: 'Registro de descartes da triagem da esteira E1.',
        theme_color: '#0d5683',
        background_color: '#f5f7fa',
        display: 'standalone',
        start_url: '/totem',
        scope: '/',
        icons: [
          { src: '/icons/hg-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/hg-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/hg.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        // API calls must never be cached as successful writes.
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
});
