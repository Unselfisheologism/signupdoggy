import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Plain Vite + React config. The Cloudflare AEO infrastructure
// (llms.txt generation, markdown twins, content-negotiation Worker)
// has been removed — the build is now just a static SPA served
// from Cloudflare Pages. The /blog and /blog/<slug> routes render
// the post body from a bundled TS string (src/lib/postContent.ts).
//
// If you want the AEO features back later (for AI agent discovery),
// re-introduce them by:
//   1. Restoring app/aeo/ and the dualmark dependencies.
//   2. Adding `npm run aeo:build` to the build script.
//   3. Adding the Worker bundle step at the end.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
