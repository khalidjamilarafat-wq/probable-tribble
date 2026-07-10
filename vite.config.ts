/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // On GitHub Pages the app is served from /probable-tribble/; on Netlify (and
  // dev) it is served from the root. The Pages workflow sets GITHUB_PAGES=true.
  base: process.env.GITHUB_PAGES ? '/probable-tribble/' : '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1500,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    globals: true,
    testTimeout: 20000,
  },
});
