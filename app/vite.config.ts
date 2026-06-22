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
//
// ── Render-blocking CSS fix ─────────────────────────────────────────────────
// By default Vite emits the bundled stylesheet as a synchronous
// <link rel="stylesheet"> in <head>. Lighthouse flags that as
// render-blocking and costs ~320ms on mobile for our 15.5 KiB CSS
// payload. We rewrite the injected tag to use the same
// `media="print" onload="this.media='all'"` swap pattern we already
// use for Google Fonts and the TownSquare widget — the browser
// fetches the CSS in parallel with HTML parse, then swaps it to
// `all` once it lands. There's no FOUC because the swap is
// sub-frame for our 15.5 KiB file.
const asyncCssPlugin = {
  name: 'signupdoggy-async-css',
  transformIndexHtml: {
    enforce: 'post' as const,
    handler(html: string): string {
      // Vite injects: <link rel="stylesheet" crossorigin href="/assets/index-XXX.css">
      // Rewrite to async pattern. We intentionally do NOT emit a
      // <noscript> fallback here — the prerender step that runs after
      // `vite build` strips and re-emits head contents with a regex
      // that doesn't preserve <noscript> wrappers as a unit. Shipping
      // a bare <noscript><link ...></noscript> here would surface as
      // an orphaned blocking <link> in the served HTML (the same
      // render-blocking bug the prerender regex used to have for
      // Google Fonts / townsquare). JS-disabled clients are <0.1% of
      // traffic; they get the prerendered <noscript><article> block
      // with raw text and no styling.
      return html.replace(
        /<link\s+rel="stylesheet"\s+crossorigin\s+href="(\/assets\/index-[^"]+\.css)"\s*\/?>/g,
        (_, href) =>
          `<link rel="preload" as="style" href="${href}" />\n` +
          `  <link rel="stylesheet" href="${href}" media="print" onload="this.media='all'" />`,
      );
    },
  },
};

export default defineConfig({
  plugins: [react(), asyncCssPlugin],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
