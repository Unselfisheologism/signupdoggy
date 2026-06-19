import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Treat .md files as static assets so the BlogPost component can
  // import them with `?raw` (the same files that the AEO Worker
  // serves as the markdown twin to AI agents at /blog/<slug>.md).
  // Without this, Rollup refuses to resolve .md imports from
  // outside the Vite `root`-bound src/ tree.
  assetsInclude: ['**/*.md'],
  build: {
    outDir: 'dist',
    // aeo:build runs before vite build and copies .md twins, llms.txt,
    // sitemap.xml, robots.txt, .aeo-tokens.json into dist/. The Vite
    // build must NOT clean those out, so we disable emptyOutDir.
    // vite build's own outputs (index.html, assets/) merge on top.
    emptyOutDir: false,
  },
});

