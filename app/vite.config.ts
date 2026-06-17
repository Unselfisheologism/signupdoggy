import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // aeo:build runs before vite build and copies .md twins, llms.txt,
    // sitemap.xml, robots.txt, .aeo-tokens.json into dist/. The Vite
    // build must NOT clean those out, so we disable emptyOutDir.
    // vite build's own outputs (index.html, assets/) merge on top.
    emptyOutDir: false,
  },
});
