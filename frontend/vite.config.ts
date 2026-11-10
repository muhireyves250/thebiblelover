import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      manifest: false, // keep the existing static public/manifest.json as-is
      // 'prompt' (not 'autoUpdate'): a new service worker installs and waits
      // rather than forcing every open tab to reload the instant it
      // activates - reloading mid-donation-form or mid-note would otherwise
      // discard whatever the visitor was typing.
      registerType: 'prompt',
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        // The SPA fallback must not swallow navigations to real static
        // files (sitemap.xml, robots.txt, the manifest) - without this,
        // visiting any of them directly serves index.html instead.
        navigateFallbackDenylist: [/\.[a-z0-9]+$/i],
      },
    }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 3000,
    host: true
  }
});
