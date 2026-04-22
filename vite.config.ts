import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// @ts-expect-error no types — dev-only middleware, see file header
import coverReviewApi from './vite-plugins/cover-review-api.mjs'
// @ts-expect-error no types — dev-only middleware, see file header
import contentAdminApi from './vite-plugins/content-admin-api.mjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), coverReviewApi(), contentAdminApi()],
  build: {
    // es2020 drops ~30 KB of legacy-browser polyfills (flagged by Lighthouse).
    // All our supported browsers understand es2020 natively.
    target: 'es2020',
    rollupOptions: {
      output: {
        // Split heavy vendors into their own chunks so the main app code can
        // deploy independently. Reduces critical-path parse time and lets
        // browsers cache vendor code across deploys.
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
        },
      },
    },
  },
})
