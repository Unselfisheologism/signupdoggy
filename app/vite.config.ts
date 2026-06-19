import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// vite.config.ts is ESM (`"type": "module"` in package.json), so
// `__dirname` isn't defined. Resolve it from import.meta.url instead.
const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    // Inline-loader for .md files imported with the `?raw` query.
    //
    // We can't use Vite's built-in `?raw` import on files outside the
    // `src/` tree (Rollup refuses to resolve `../aeo/content/blog/*.md`
    // via the default loader), and `import.meta.glob` + `?raw` doesn't
    // inline the content reliably under Vite 5 + Rollup. So we ship a
    // tiny pre-loader that reads the .md file at build time and emits
    // it as a JS string.
    //
    // The same .md file is the source of truth for the AEO markdown
    // twin served to AI agents at /blog/<slug>.md — this loader
    // keeps the React render and the AI-readable twin literally the
    // same content. No dual-source drift.
    {
      name: 'md-inline-loader',
      enforce: 'pre',
      load(id) {
        if (!id.endsWith('.md?raw')) return null;
        // `id` arrives already resolved by Vite (absolute path with
        // `?raw` query suffix). Strip the query and read the file.
        const filePath = id.split('?')[0];
        try {
          const content = readFileSync(filePath, 'utf8');
          // JSON.stringify escapes the content for safe embedding in
          // a JS module. We expose the string as the default export
          // so callers can write:
          //   import md from '../aeo/content/blog/<slug>.md?raw';
          return `export default ${JSON.stringify(content)};`;
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          throw new Error(`[md-inline-loader] failed to read ${filePath}: ${message}`);
        }
      },
    },
  ],
  build: {
    outDir: 'dist',
    // aeo:build runs before vite build and copies .md twins, llms.txt,
    // sitemap.xml, robots.txt, .aeo-tokens.json into dist/. The Vite
    // build must NOT clean those out, so we disable emptyOutDir.
    // vite build's own outputs (index.html, assets/) merge on top.
    emptyOutDir: false,
  },
});


