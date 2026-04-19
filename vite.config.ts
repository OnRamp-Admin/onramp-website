import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// @ts-expect-error no types — dev-only middleware, see file header
import coverReviewApi from './vite-plugins/cover-review-api.mjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), coverReviewApi()],
})
