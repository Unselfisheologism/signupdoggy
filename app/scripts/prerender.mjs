// scripts/prerender.mjs
//
// Build-time static HTML generator for every public route.
//
// Why this exists:
//   SignupDoggy ships as a Vite SPA. By default, crawlers (Googlebot,
//   Bingbot, AI scrapers) see a blank page because the route content
//   is rendered by React after JS executes. Google CAN render JS but
//   it's a 2nd-wave render — slow, fragile, and meta tags often show
//   up too late for SERP snippets.
//
//   This script fixes that. After `vite build` writes the SPA shell
//   to dist/index.html, we read that shell, and for every public
//   route we write a copy of the shell to dist/<route>/index.html
//   with route-specific <title>, meta description, canonical, OG,
//   Twitter, JSON-LD, AND a hidden <noscript> block carrying the
//   full visible body text. Crawlers (and humans with JS off) get a
//   fully-formed page on the first byte. The React SPA then hydrates
//   on top of it for actual interaction.
//
//   Cloudflare Pages serves dist/<route>/index.html as a static file
//   for /<route>, and falls back to /index.html (the SPA shell) for
//   anything not prerendered (handled by the _redirects file).
//
//   The set of routes prerendered is the set of keys in seoConfig.ts
//   plus one entry per blog post in src/lib/posts.ts.
//
// Inputs (CLI):
//   --dist=<path>     Vite build output (default: ./dist)
//   --config=<path>   Path to seoConfig.ts (default: ../src/lib/seoConfig.ts)
//
// We can't `import` the .ts config directly from a Node script
// without a TS loader, so we read its source, evaluate a controlled
// subset, and pull out the ROUTES export. Simpler alternative: the
// prerender module also accepts an `--out=<file>` JSON manifest
// written at build time by Vite. We use the eval approach because
// it requires zero changes to the build pipeline.

import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const APP_ROOT = resolve(__dirname, '..');

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const [k, v] = a.slice(2).split('=');
      return [k, v ?? 'true'];
    }),
);

const DIST = resolve(APP_ROOT, args.dist ?? 'dist');
const CONFIG_TS = resolve(APP_ROOT, args.config ?? 'src/lib/seoConfig.ts');
const POSTS_TS = resolve(APP_ROOT, args.posts ?? 'src/lib/posts.ts');
const POSTS_INDEX_MD = resolve(APP_ROOT, args.postsIndex ?? 'src/lib/postContent.ts');

// ---------- Load TS sources as text ----------
async function loadText(p) {
  return readFile(p, 'utf8');
}

// ---------- Evaluate seoConfig.ts ROUTES export ----------
// We don't pull in a TypeScript compiler. We regex-extract the
// ROUTES object literal. It's stable and machine-generated here.
// This is intentionally dumb: if seoConfig.ts ever stops being a
// simple const literal of a single object, this will break and we
// should switch to a real .mjs export.

function extractRoutesObject(source) {
  // Find `export const ROUTES: Record<...> = {` then walk braces
  // to find the matching close.
  const marker = 'export const ROUTES';
  const idx = source.indexOf(marker);
  if (idx < 0) throw new Error('ROUTES export not found in seoConfig.ts');
  const eq = source.indexOf('=', idx);
  if (eq < 0) throw new Error('ROUTES = not found');
  const open = source.indexOf('{', eq);
  if (open < 0) throw new Error('ROUTES object literal not found');
  let depth = 0;
  let i = open;
  let inString = null; // '"' | "'" | '`'
  let escape = false;
  for (; i < source.length; i++) {
    const c = source[i];
    if (escape) { escape = false; continue; }
    if (c === '\\') { escape = true; continue; }
    if (inString) {
      if (c === inString) inString = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { inString = c; continue; }
    if (c === '/' && source[i + 1] === '/') { while (i < source.length && source[i] !== '\n') i++; continue; }
    if (c === '/' && source[i + 1] === '*') { i += 2; while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) i++; i++; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { i++; break; } }
  }
  if (depth !== 0) throw new Error('Unbalanced braces in ROUTES');
  const objLiteral = source.slice(open, i);

  // The schemas inside ROUTES reference `SITE.shortDescription`,
  // `SITE.url`, etc. We need to evaluate SITE first and make it
  // available inside the Function scope. Reuse the same brace-counting
  // pass to pull the SITE literal out of the file.
  const siteLiteral = extractSiteLiteral(source);

  // Make the object literal safe to evaluate. We wrap the literal in
  // parentheses so it parses as an EXPRESSION — without the parens,
  // a `{...}` at the top of a Function body is parsed as a BLOCK
  // STATEMENT, and the inner `key: value` pairs become labeled
  // statements. The parser then chokes on the first `,` between
  // labels (or on the second `:` in a label-position property name),
  // failing with `SyntaxError: Unexpected token ':'` even though
  // the object literal is otherwise valid JavaScript.
  //
  // Wrapping in `(${objLiteral})` forces expression-context parsing
  // and works regardless of the object's leading or trailing syntax.
  // eslint-disable-next-line no-new-func
  const ROUTES = new Function(
    `const SITE = (${siteLiteral});\n` +
    `const ROUTES = (${objLiteral});\n` +
    `return ROUTES;`
  )();
  return ROUTES;
}

// Extract the SITE object literal from seoConfig.ts. Same brace-counting
// pass as extractRoutesObject — duplicated here so SITE and ROUTES can
// be parsed independently before being joined at eval time.
function extractSiteLiteral(source) {
  const marker = 'export const SITE';
  const idx = source.indexOf(marker);
  if (idx < 0) return 'undefined';
  const eq = source.indexOf('=', idx);
  const open = source.indexOf('{', eq);
  let depth = 0; let i = open; let inString = null; let escape = false;
  for (; i < source.length; i++) {
    const c = source[i];
    if (escape) { escape = false; continue; }
    if (c === '\\') { escape = true; continue; }
    if (inString) { if (c === inString) inString = null; continue; }
    if (c === '"' || c === "'" || c === '`') { inString = c; continue; }
    if (c === '/' && source[i + 1] === '/') { while (i < source.length && source[i] !== '\n') i++; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { i++; break; } }
  }
  if (depth !== 0) throw new Error('Unbalanced braces in SITE');
  return source.slice(open, i);
}

function extractPostsArray(source) {
  const marker = 'export const posts';
  const idx = source.indexOf(marker);
  if (idx < 0) return [];
  const eq = source.indexOf('=', idx);
  const open = source.indexOf('[', eq);
  let depth = 0;
  let i = open;
  let inString = null;
  let escape = false;
  for (; i < source.length; i++) {
    const c = source[i];
    if (escape) { escape = false; continue; }
    if (c === '\\') { escape = true; continue; }
    if (inString) { if (c === inString) inString = null; continue; }
    if (c === '"' || c === "'" || c === '`') { inString = c; continue; }
    if (c === '/' && source[i + 1] === '/') { while (i < source.length && source[i] !== '\n') i++; continue; }
    if (c === '[') depth++;
    else if (c === ']') { depth--; if (depth === 0) { i++; break; } }
  }
  const arrLiteral = source.slice(open, i);
  // eslint-disable-next-line no-new-func
  // Wrap in parens — see extractRoutesObject for why this matters
  // (top-level `{` parses as a block statement, not an object).
  return new Function(`const posts = (${arrLiteral}); return posts;`)();
}

function extractPostBodies(source) {
  // The postContent.ts file declares a `POST_BODIES: Record<string, string> = { ... }`
  // Each value is a template literal spanning many lines. The simplest
  // approach: locate the marker, then find the matching close brace
  // while tracking template-literal escapes. We then JS-eval the slice
  // (it's all string literals, no user data).
  const marker = 'export const POST_BODIES';
  const idx = source.indexOf(marker);
  if (idx < 0) return {};
  const eq = source.indexOf('=', idx);
  const open = source.indexOf('{', eq);
  let depth = 0;
  let i = open;
  let inString = null;
  let escape = false;
  for (; i < source.length; i++) {
    const c = source[i];
    if (escape) { escape = false; continue; }
    if (c === '\\') { escape = true; continue; }
    if (inString) { if (c === inString) inString = null; continue; }
    if (c === '"' || c === "'" || c === '`') { inString = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { i++; break; } }
  }
  const objLiteral = source.slice(open, i);
  // eslint-disable-next-line no-new-func
  // Wrap in parens — see extractRoutesObject for why this matters
  // (top-level `{` parses as a block statement, not an object).
  return new Function(`const POST_BODIES = (${objLiteral}); return POST_BODIES;`)();
}

// ---------- FAQ + HowTo extraction from post body ----------
// Mirrors the logic in src/pages/BlogPost.tsx so the prerendered
// HTML includes the same rich-snippet JSON-LD that the React app emits.

function extractFaqFromBody(markdown) {
  // FAQ section: starts with "## FAQ" (optionally followed by blank
  // lines) and ends at the next "## " heading, the "---" separator,
  // or end of string. We capture up to the end and trim.
  const idx = markdown.search(/##\s+FAQ\s*\n/);
  if (idx < 0) return [];
  // From after "## FAQ\n" to the end of the FAQ section.
  const start = idx + markdown.slice(idx).indexOf('\n') + 1;
  const rest = markdown.slice(start);
  // Find the end: next "## " heading, "---" separator, or end of string.
  let endMatch = rest.match(/\n##\s|\n---\s*$/);
  const end = endMatch ? endMatch.index : rest.length;
  const block = rest.slice(0, end);
  const items = [];
  // Match **Q: question?** followed by A: answer (until next Q:).
  const qaRe = /\*\*Q:\s*([^*?]+?)\?\*\*\s*\n\s*A:\s*([\s\S]*?)(?=\n\s*\*\*Q:|$)/g;
  let m;
  while ((m = qaRe.exec(block)) !== null) {
    const question = (m[1].trim() + '?').replace(/"/g, '\\"');
    const answer = m[2].trim().replace(/\s+/g, ' ').replace(/"/g, '\\"');
    if (question.length > 5 && answer.length > 10) {
      items.push({ question, answer });
    }
  }
  return items;
}

function extractHowToFromBody(markdown) {
  // Match common "step-like" headings:
  //   ## Step 1. Title
  //   ## 1. Title
  //   ## Approach 1: Title
  //   ### Step 1. Title
  if (!/##\s+(Step\s+\d+|Approach\s+\d+|\d+\.)/im.test(markdown)) return null;
  const steps = [];
  // Step pattern: `## Step 1. Title` or `## Approach 1: Title` or `## 1. Title`
  const stepRe = /##\s+(Step\s+\d+|Approach\s+\d+|\d+)\.?\s*:?\s+([^\n]+)\n+([\s\S]*?)(?=\n##\s+(Step\s+\d+|Approach\s+\d+|\d+)|\n##\s|$)/gi;
  let m;
  while ((m = stepRe.exec(markdown)) !== null) {
    const name = m[2].trim().replace(/"/g, '\\"');
    const text = m[3].trim().split('\n\n')[0].replace(/\n/g, ' ').replace(/"/g, '\\"');
    if (name && text) {
      steps.push({ name, text: text.slice(0, 500) });
    }
  }
  return steps.length >= 2 ? steps : null;
}

function buildBlogSchemas(p, POST_BODIES) {
  const body = POST_BODIES[p.slug] || '';
  const faqItems = extractFaqFromBody(body);
  const howToSteps = extractHowToFromBody(body);
  const isTutorial = (p.tags || []).some((t) => /Tutorial|Node\.js|Supabase|Integration/i.test(t));

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      dateModified: p.date,
      inLanguage: 'en-US',
      author: { '@type': 'Person', name: 'Jeffrin James', email: 'mailto:jeffrinjames99@gmail.com', url: 'https://signupdoggy.pages.dev/author/jeffrin-james', jobTitle: 'Founder & Solo Developer', worksFor: { '@type': 'Organization', name: 'SignupDoggy', url: 'https://signupdoggy.pages.dev' } },
      publisher: { '@type': 'Organization', name: 'SignupDoggy', url: 'https://signupdoggy.pages.dev', logo: { '@type': 'ImageObject', url: 'https://signupdoggy.pages.dev/android-chrome-512x512.png' } },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `https://signupdoggy.pages.dev/blog/${p.slug}` },
      keywords: (p.tags || []).join(', '),
            url: `https://signupdoggy.pages.dev/blog/${p.slug}`,
            // Per-post featured image — generated by /api/featured/[slug].svg on
            // Cloudflare Pages. Drives Google Images traffic and the
            // primaryImageOfPage schema attribute below.
            image: `https://signupdoggy.pages.dev/api/featured/${encodeURIComponent(p.slug)}.svg`,
            primaryImageOfPage: {
              '@type': 'ImageObject',
              url: `https://signupdoggy.pages.dev/api/featured/${encodeURIComponent(p.slug)}.svg`,
              width: 1200,
              height: 630,
            },
            articleSection: (p.tags || [])[0] || 'Signup Quality',
            wordCount: Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length)),
            timeRequired: p.readingTime,
          },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://signupdoggy.pages.dev/' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://signupdoggy.pages.dev/blog' },
        { '@type': 'ListItem', position: 3, name: p.title, item: `https://signupdoggy.pages.dev/blog/${p.slug}` },
      ],
    },
  ];

  if (faqItems.length >= 2) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    });
  }

  if (isTutorial && howToSteps) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: p.title,
      description: p.description,
      totalTime: p.readingTime,
      step: howToSteps.map((s, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: s.name,
        text: s.text,
      })),
    });
  }

  return schemas;
}

// ---------- Markdown → plain text for noscript body ----------
function mdToPlain(md) {
  if (!md) return '';
  let s = md;
  // Strip front-matter if present.
  s = s.replace(/^---\n[\s\S]*?\n---\n/, '');
  // Drop aeo:source HTML comments.
  s = s.replace(/<!--\s*aeo:source=.*?-->/gs, '');
  // Drop code fences but keep the text inside (so crawler sees it).
  s = s.replace(/```[\s\S]*?```/g, (m) => m.replace(/```\w*\n?|```/g, ''));
  // Headings → keep the text.
  s = s.replace(/^#{1,6}\s+(.*)$/gm, '$1');
  // Bold/italic markers.
  s = s.replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1');
  // Links: keep label, drop url.
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // Images: drop.
  s = s.replace(/!\[[^\]]*\]\([^)]+\)/g, '');
  // Blockquote markers.
  s = s.replace(/^>\s?/gm, '');
  // List markers.
  s = s.replace(/^[\s]*[-*+]\s+/gm, '• ');
  s = s.replace(/^[\s]*\d+\.\s+/gm, '');
  // Strip leading H1 (we render our own h1 in the React page).
  s = s.replace(/^#\s+.*\n+/, '');
  // Collapse whitespace.
  s = s.replace(/\n{3,}/g, '\n\n').trim();
  return s;
}

function htmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---------- <head> rewriting ----------
function buildHead(config, extraSchemas = []) {
  const canonical = config.canonical ?? `https://signupdoggy.pages.dev${config.path}`;
  // Blog posts get per-post featured images via the /api/featured/[slug]
  // Cloudflare Pages Function. Other routes fall back to the global
  // SITE.defaultOgImage set in seoConfig.ts.
  const isBlogPost = config.path.startsWith('/blog/') && config.path.length > '/blog/'.length;
  const ogImage = config.ogImage ?? (
    isBlogPost
      ? `https://signupdoggy.pages.dev/api/featured/${encodeURIComponent(config.path.replace('/blog/', ''))}.svg`
      : 'https://signupdoggy.pages.dev/og-image.png'
  );
  const robots = config.noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  // Speakable schema (task #7) is added per-route via the WebPage schema
  // in seoConfig.ts. We also stamp a primaryImageOfPage on the same WebPage
  // schema (task #13) so Google Images can attribute the hero image.
  const allSchemas = [...(config.schemas ?? []), ...extraSchemas];

  // Build hreflang + x-default blocks (task #1).
  // Single-language site today (en-US), so we emit one language entry plus
  // the x-default fallback. When translations ship, just append more rows.
  const hreflangEn = `<link rel="alternate" hreflang="en" href="${htmlEscape(canonical)}" />`;
  const hreflangDefault = `<link rel="alternate" hreflang="x-default" href="${htmlEscape(canonical)}" />`;

  return `
  <title>${htmlEscape(config.title)}</title>
  <meta name="description" content="${htmlEscape(config.description)}" />
  ${config.keywords ? `<meta name="keywords" content="${htmlEscape(config.keywords)}" />` : ''}
  <meta name="robots" content="${robots}" />
  <meta name="googlebot" content="${robots}" />
  <meta name="author" content="Jeffrin James" />
  <meta name="rating" content="general" />
  <meta name="distribution" content="global" />
  <meta name="revisit-after" content="7 days" />
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
  <meta http-equiv="content-language" content="en-US" />
  <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
  <meta name="theme-color" content="#f5f5f5" media="(prefers-color-scheme: light)" />
  <link rel="canonical" href="${htmlEscape(canonical)}" />
  ${hreflangEn}
  ${hreflangDefault}
  <link rel="alternate" type="text/plain" href="https://signupdoggy.pages.dev/llms.txt" title="llms.txt — plain-text index for AI agents" />
  <link rel="alternate" type="text/plain" href="https://signupdoggy.pages.dev/llms-full.txt" title="llms-full.txt — full corpus for AI agents" />
  <link rel="sitemap" type="application/xml" href="https://signupdoggy.pages.dev/sitemap.xml" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preconnect" href="https://townsquare.cauenapier.com" />
    <!-- TownSquare widget.css is no longer preloaded here. It was 47 KiB
         of unused CSS that competed with the LCP for the main thread even
         though the widget only mounts when the footer scrolls into view.
         The deferred loader in index.html injects the stylesheet on demand.
         We keep the preconnect so the dynamic import is DNS+TLS-warm when
         the loader finally fires. -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.json" crossorigin="use-credentials" />
  <meta property="og:title" content="${htmlEscape(config.title)}" />
  <meta property="og:description" content="${htmlEscape(config.description)}" />
  <meta property="og:type" content="${config.path === '/blog' || config.path.startsWith('/blog/') ? 'article' : 'website'}" />
  <meta property="og:url" content="${htmlEscape(canonical)}" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:site_name" content="SignupDoggy" />
  <meta property="og:image" content="${htmlEscape(ogImage)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${htmlEscape(config.title)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${htmlEscape(config.title)}" />
  <meta name="twitter:description" content="${htmlEscape(config.description)}" />
  <meta name="twitter:image" content="${htmlEscape(ogImage)}" />
  <meta name="twitter:image:alt" content="${htmlEscape(config.title)}" />
  <meta name="twitter:site" content="@signupdoggy" />
  ${allSchemas.map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n  ')}
  ${config.modulePreload ? `<link rel="modulepreload" href="${htmlEscape(config.modulePreload)}" />` : ''}
`;
}

function buildNoscript(config, bodyText) {
  // Crawlers that don't run JS get the title, description, and a
  // plain-text version of the visible body so they can still index.
  if (!bodyText) return '';
  return `<noscript>
<article>
<h1>${htmlEscape(config.title)}</h1>
<p>${htmlEscape(config.description)}</p>
<pre style="white-space:pre-wrap;font-family:system-ui">${htmlEscape(bodyText).slice(0, 20000)}</pre>
</article>
</noscript>`;
}

async function fileExists(p) {
  try { await stat(p); return true; } catch { return false; }
}

// ---------- Extract ALTERNATIVES slugs + names from Alternatives.tsx ----------
// We read the source, brace-walk the ALTERNATIVES array literal, and
// pull out every entry's slug + name. Keeps the dynamic prerender in
// sync with the React component's data without duplicating the list.

async function extractAlternativesData() {
  const ALTS_TS = resolve(APP_ROOT, 'src/pages/Alternatives.tsx');
  const src = await readFile(ALTS_TS, 'utf8');
  const marker = 'const ALTERNATIVES';
  const idx = src.indexOf(marker);
  if (idx < 0) return [];
  const eq = src.indexOf('=', idx);
  const open = src.indexOf('[', eq);
  let depth = 0;
  let i = open;
  let inString = null;
  let escape = false;
  for (; i < src.length; i++) {
    const c = src[i];
    if (escape) { escape = false; continue; }
    if (c === '\\') { escape = true; continue; }
    if (inString) { if (c === inString) inString = null; continue; }
    if (c === '"' || c === "'" || c === '`') { inString = c; continue; }
    if (c === '/' && src[i + 1] === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
    if (c === '[') depth++;
    else if (c === ']') { depth--; if (depth === 0) { i++; break; } }
  }
  const arrLiteral = src.slice(open, i);
  // eslint-disable-next-line no-new-func
  const ALTERNATIVES = new Function(`return (${arrLiteral});`)();
  return ALTERNATIVES.map((a) => ({ slug: a.slug, name: a.name })).filter((x) => x.slug && x.name);
}

async function main() {
  if (!(await fileExists(DIST))) {
    console.error(`[prerender] dist not found at ${DIST}. Run \`npm run build\` first.`);
    process.exit(1);
  }
  const shellHtml = await readFile(join(DIST, 'index.html'), 'utf8');

  // Extract the Vite-built JS bundle path from the shell so we can emit
  // a <link rel="modulepreload"> for it on every prerendered route
  // (task #22). Speeds up LCP by letting the browser fetch the bundle
  // in parallel with the HTML parse.
  const bundleMatch = shellHtml.match(/<script[^>]+src="(\/assets\/[^"]+\.js)"/i);
  const modulePreload = bundleMatch ? bundleMatch[1] : null;

  const configSource = await loadText(CONFIG_TS);
  const ROUTES = extractRoutesObject(configSource);
  const postsSource = await loadText(POSTS_TS);
  const posts = extractPostsArray(postsSource);
  const postBodiesSource = await loadText(POSTS_INDEX_MD).catch(() => '');
  const POST_BODIES = postBodiesSource ? extractPostBodies(postBodiesSource) : {};

  // Resolve each post's body text for the <noscript> block.
  const postEntries = posts.map((p) => ({
    config: {
      path: `/blog/${p.slug}`,
      title: `${p.title} — SignupDoggy Blog`,
      description: p.description,
      keywords: (p.tags || []).concat(['signupdoggy', 'signup quality', 'indie hacker', 'fraud prevention']).join(', '),
      canonical: `https://signupdoggy.pages.dev/blog/${p.slug}`,
      schemas: buildBlogSchemas(p, POST_BODIES),
    },
    body: mdToPlain(POST_BODIES[p.slug] || ''),
    slug: p.slug,
  }));

  // Static page bodies for the high-priority routes. These come from
    // a parallel set of plain-text strings we keep in sync with the
    // React components. They go into the <noscript> block so non-JS
    // crawlers and humans see real content, not just a title.
    const bodyByRoute = await loadStaticBodies();
    const routeEntries = Object.values(ROUTES).map((r) => ({
      config: r,
      body: bodyByRoute[r.path] || '',
    }));

    // Dynamic alternatives pages (/alternatives/<slug>) — generated
      // by reading the Alternatives.tsx source and pulling out the
      // ALTERNATIVES array slugs. Each gets its own prerendered HTML
      // page so Google indexes each "X alternative" query as a separate
      // URL with the right meta + JSON-LD.
      const altData = await extractAlternativesData().catch(() => []);
      const altEntries = altData.map(({ slug, name }) => ({
        config: {
          path: `/alternatives/${slug}`,
          title: `${name} alternative — SignupDoggy comparison (2026)`,
          description: `${name} alternative for indie SaaS teams. Pricing, accuracy, integration time, and which one fits a 2-50 person team. Honest comparison of ${name} and SignupDoggy.`,
          keywords: `${name} alternative, ${name} vs SignupDoggy, fraud API alternative, ${slug} alternative, ${name} pricing, ${name} review`,
          canonical: `https://signupdoggy.pages.dev/alternatives/${slug}`,
          schemas: [
            {
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: `${name} alternative — SignupDoggy comparison (2026)`,
              description: `Honest comparison of ${name} and SignupDoggy. Pricing, accuracy, integration time.`,
              datePublished: '2026-06-20',
              dateModified: '2026-06-20',
              inLanguage: 'en-US',
              author: { '@type': 'Person', name: 'Jeffrin James', email: 'mailto:jeffrinjames99@gmail.com' },
              publisher: { '@type': 'Organization', name: 'SignupDoggy', url: 'https://signupdoggy.pages.dev', logo: { '@type': 'ImageObject', url: 'https://signupdoggy.pages.dev/android-chrome-512x512.png' } },
              mainEntityOfPage: { '@type': 'WebPage', '@id': `https://signupdoggy.pages.dev/alternatives/${slug}` },
              url: `https://signupdoggy.pages.dev/alternatives/${slug}`,
            },
            {
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://signupdoggy.pages.dev/' },
                { '@type': 'ListItem', position: 2, name: 'Alternatives', item: 'https://signupdoggy.pages.dev/alternatives' },
                { '@type': 'ListItem', position: 3, name, item: `https://signupdoggy.pages.dev/alternatives/${slug}` },
              ],
            },
          ],
        },
        body: bodyByRoute[`/alternatives/${slug}`] || '',
      }));

      const all = [...routeEntries, ...postEntries, ...altEntries];
        let count = 0;
        for (const { config, body } of all) {
          if (config.path === '/auth' || config.path === '/login' || config.path === '/signup' || config.path === '/dashboard' || config.path === '/keys' || config.path === '/checkout') continue;
          // Stamp the Vite bundle path onto every config so buildHead can emit
          // a <link rel="modulepreload"> for it (speeds up LCP).
          const html = rewriteShell(shellHtml, { ...config, modulePreload }, body);
          const out = config.path === '/' ? join(DIST, 'index.html') : join(DIST, config.path, 'index.html');
          await mkdir(dirname(out), { recursive: true });
          await writeFile(out, html, 'utf8');
          count++;
          console.log(`[prerender] ${config.path} → ${out.replace(DIST + '/', '')}`);
        }
        console.log(`[prerender] wrote ${count} static HTML files.`);

        // Stamp the current UTC date into sitemap lastmod fields. Cloudflare Pages
        // copies public/sitemap.xml to dist/sitemap.xml verbatim — we replace the
        // <lastmod>YYYY-MM-DD</lastmod> placeholder at build time so Google sees
        // fresh timestamps on every deploy instead of a static date that ages out.
        const today = new Date().toISOString().slice(0, 10);
        for (const file of ['sitemap.xml', 'image-sitemap.xml']) {
          try {
            const p = join(DIST, file);
            const src = await readFile(p, 'utf8');
            const out = src.replace(/<lastmod>YYYY-MM-DD<\/lastmod>/g, `<lastmod>${today}</lastmod>`);
            if (out !== src) {
              await writeFile(p, out, 'utf8');
              console.log(`[prerender] ${file} lastmod → ${today}`);
            }
          } catch {
            // image-sitemap.xml is optional — skip silently if missing
          }
        }
      }

function rewriteShell(shell, config, body) {
  // Replace the entire <head> contents. We keep the <html>, the first
  // <meta charset> + <meta viewport> lines (they should stay at the
  // top of <head> per HTML spec), then drop everything else and
  // insert our own.
  const newHead = buildHead(config);

  // The shell looks roughly like:
  //   <!doctype html><html lang="en"><head>
  //     <meta charset="UTF-8" />
  //     <meta name="viewport" ... />
  //     <link rel="preconnect" ... />
  //     <script type="module" crossorigin src="/assets/index-XXX.js"></script>
  //     <link rel="stylesheet" crossorigin href="/assets/index-XXX.css">
  //   </head>
  //   <body>
  //     <div id="root"></div>
  //   </body></html>
  //
  // CRITICAL: the Vite-injected <script type="module"> and
  // <link rel="stylesheet"> tags sit inside <head>, NOT inside
  // <body>. If we drop them here the React SPA never loads and
  // users see a blank page. They must be preserved.

  // Preserve the preconnect + async Google Fonts link + async TownSquare
  // widget CSS + the Vite bundle (JS + CSS). Without the Vite bundle,
  // the React SPA never boots and the page renders blank. The regex
  // is intentionally narrow so it ONLY matches the async / preload
  // variants of the external stylesheets — it does NOT match the bare
  // <link rel="stylesheet"> that sits inside <noscript> as a no-JS
  // fallback. Pulling that fallback out of <noscript> (which the old
  // regex did) turned it into a render-blocking request for every
  // prerendered page; that cost 1,200ms on the critical path.
  //
  // We also strip HTML comments from the head before matching — the
  // source template embeds example <link rel="preload"> syntax inside
  // a `<!-- ... -->` block for documentation, and the regex would
  // happily match that prose and surface broken tags into the served
  // HTML.
  const headMatch = shell.match(/<head>([\s\S]*?)<\/head>/i);
  if (!headMatch) {
    // No head — unlikely, but bail safely.
    return shell;
  }
  const headContent = headMatch[1].replace(/<!--[\s\S]*?-->/g, '');
  const keep = [];
  const keepRe = /(<link[^>]*rel=["']?preconnect["']?[^>]*>|<link[^>]*rel=["']?modulepreload["']?[^>]*>|<link\s+rel=["']?preload["']?[^>]*>|<link\s+rel=["']?stylesheet["']?[^>]*media=["']print["'][^>]*>|<link[^>]*href=["']?\/assets\/[^"']+\.css["']?[^>]*>|<script[^>]*src=["']?\/assets\/[^"']+\.js["']?[^>]*><\/script>)/gi;
  let m;
  while ((m = keepRe.exec(headContent)) !== null) keep.push(m[0]);

  // Re-assemble.
  const newShell = shell.replace(
    /<head>[\s\S]*?<\/head>/i,
    `<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${newHead}
  ${keep.join('\n  ')}
  ${buildNoscript(config, body)}
</head>`,
  );
  return newShell;
}

// ---------- Static body text (mirrors the React page content) ----------
// We keep one big object that contains the visible body text for
// every prerendered route. This is what crawlers and humans-without-JS
// see. We keep it in sync with the React components by hand; it's
// short per page, and the cost of getting it wrong is just that the
// <noscript> block shows a slightly stale version — the SPA still
// hydrates with the real content for users with JS.
//
// The blog post bodies come from POST_BODIES in postContent.ts and
// are filled in above; this function only handles the static pages.

async function loadStaticBodies() {
  // Returned object: pathname → visible text.
  return {
    '/': `SignupDoggy is a pay-per-call fraud-detection API for SaaS signups.

CATCH FAKE SIGNUPS BEFORE THEY SHIP
Disposable emails. VPN exits. Tor nodes. One POST to /v1/check returns a 0-1 risk score. $0.01 a call. Never expires.

What we check on every call:
- 125,847 disposable email domains
- 70,821 Tor exit nodes
- 24,000+ VPN / hosting ASNs
- Role-based email patterns
- Per-account custom blacklists
- Aggregated risk score in under 50ms

Pricing: $5 Solo (1,000 requests), $25 Pro (5,000 requests), $100 Scale (25,000 requests). Pay once, no expiry, no subscription, no sales call.

Compared to IPQualityScore ($0.05-$0.25 per call, $25/mo minimum) and SignupGate ($0.05-$0.30, $29/mo, annual contract), SignupDoggy is 5-30x cheaper per request and zero monthly minimum.

API endpoint: POST https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check
Headers: x-api-key: $SIGNUPDOGGY_KEY
Body: {"email": "user@example.com", "ip": "1.2.3.4"}

Response includes per-signal risk scores, an overall risk band (low/medium/high), and a recommendation (allow/review/block). One credit per call.

Built by Jeffrin James, solo founder in Mumbai, India.`,

    '/docs': `SignupDoggy API Reference

ONE ENDPOINT. ONE API KEY. ONE DECISION: ALLOW / REVIEW / BLOCK.

Base URL: https://signupdoggy-api.jeffrinjames99.workers.dev

Authentication: pass your API key in the X-API-KEY header. Keys are 52-character strings prefixed with SD_.

Endpoints:

POST /v1/check — Evaluate email, IP, and/or phone in one call. Pass at least one of email, ip, or phone. Returns per-input signals, an overall risk band, and a recommendation. Costs one credit.

POST /v1/keys — Mint a new API key. No auth header required. Returns 201.

POST /v1/blacklist — Add or remove an email / IP / phone on your account blacklist. Blacklisted values return recommendation: "block" whatever the other signals say.

GET /v1/stats — Requests, blocks (by reason), and estimated cost for today (UTC).

Response headers from /v1/check: X-Fraud-Blocked-Today, X-Fraud-Blocked-Reason, X-Estimated-Cost, X-Credit-Balance.

Errors: 400 (bad request, invalid JSON, no email/ip/phone supplied), 401 (unauthorized, missing or invalid API key), 402 (out of credits), 500 (internal error).

Pricing inline: $0.01 per request, deducted from your pre-paid credit balance. Credits never expire. No monthly fee. No sales call.

Languages: curl, Node.js, and Python examples are provided for every endpoint.`,

    '/pricing': `SignupDoggy Pricing — Three sizes. One price per request. No subscription. No monthly fee. No card on file. Buy credits once, use them whenever.

SOLO — $5 — 1,000 requests
- 1,000 API calls
- Disposable email detection
- VPN / Tor / proxy signals
- Custom blacklists
- One-time payment

PRO — $25 — 5,000 requests (MOST POPULAR)
- 5,000 API calls
- Everything in Solo
- Phone number validation
- Risk-score explanation
- Email support
- One-time payment

SCALE — $100 — 25,000 requests
- 25,000 API calls
- Everything in Pro
- Bulk blacklist import
- Webhook on score > 0.7
- Priority support
- One-time payment

Pay once. Use forever. No expiry. Cancel is a non-concept.

Top up at any time. The minimum purchase is $5.`,

    '/blog': `SignupDoggy Blog — long-form notes on signup quality, user validation, and the indiechauning of anti-fraud infrastructure. By Jeffrin James, founder.

Posts:
- How SaaS founders should actually get user validation (and why most advice is wrong)
- Best free disposable email checker API for 2026
- How to block VPN and Tor signups without blocking real users
- IPQualityScore vs SignupDoggy: an honest comparison
- Cloudflare Turnstile vs server-side fraud APIs: which actually catches bots?`,

    '/terms': `SignupDoggy Terms of Service

By using the SignupDoggy API or website you agree to these terms.

1. The service. SignupDoggy is a fraud-detection API for SaaS signup forms. You send an email, IP, and/or phone and receive a 0-1 risk score plus an allow/review/block recommendation.

2. API keys. API keys are 52-character strings prefixed with SD_. You are responsible for keeping them secret. Do not commit them to git, hardcode them in client-side JavaScript, or share them publicly.

3. Acceptable use. You may not use SignupDoggy to score signups for products that facilitate fraud, harassment, or illegal activity. You may not resell the API without written permission.

4. Billing. You buy credits once (Solo $5 / Pro $25 / Scale $100). Credits never expire. There is no monthly fee and no subscription. If your credit balance reaches zero, additional API calls return HTTP 402 until you top up.

5. Refunds. We do not offer refunds on credit purchases. If you believe a charge was made in error, email jeffrinjames99@gmail.com within 30 days.

6. Liability. The API is provided as-is. You are responsible for any decision you make based on the risk score. We do our best to keep the disposable-domain, Tor-exit-node, and VPN/ASN lists accurate, but we make no guarantee of 100% catch rate or 0% false-positive rate.

7. Privacy. We do not log the bodies of the requests you send. We log the API key, the timestamp, the recommendation, and the credit balance after each call. We do not sell data.

8. Termination. We may suspend your API key for violation of these terms. We will attempt to contact you at the email on file before suspension.

9. Contact. jeffrinjames99@gmail.com. Jeffrin James, Mumbai, India.`,

    '/privacy': `SignupDoggy Privacy Policy

Last updated: 2026-06-19.

1. What we collect. To bill you for API calls, we log: your API key, the timestamp, the recommendation (allow/review/block), the credit balance after the call, and the X-Fraud-Blocked-Reason header value.

2. What we do NOT collect. We do not log the bodies of the /v1/check requests you send. We do not store the email addresses, IP addresses, or phone numbers you submit. We do not use third-party analytics on this site.

3. What we store about your account. We store the email address you used to sign up, the date you signed up, the credit balance, and the list of custom blacklist entries you've added.

4. Cookies. We do not use tracking cookies. We use a single Supabase auth cookie to keep you logged in. We do not use Google Analytics, Facebook Pixel, or any other third-party tracker.

5. Third parties. We use Cloudflare to host the site and the API. We use Supabase to store account data. We use Dodo Payments to process credit-card payments — Dodo's privacy policy applies when you buy credits.

6. Data retention. /v1/check request bodies are not stored, period. Custom blacklist entries are stored until you delete them. Account data is stored until you delete your account.

7. Your rights. You can request a copy of all data we have about you, or request deletion, by emailing jeffrinjames99@gmail.com. We will respond within 30 days.

9. Children's privacy. SignupDoggy is not directed at children under 13. We do not knowingly collect data from children under 13.

10. Changes. We will post any changes to this policy on this page and email active customers.

11. Contact. jeffrinjames99@gmail.com. Jeffrin James, Mumbai, India.`,

    '/vs/ipqualityscore': `IPQualityScore vs SignupDoggy — 2026 comparison

IPQualityScore (IPQS) is the legacy choice. SignupDoggy is the indie-hacker upstart. Both score signups for fraud risk. They are priced differently, integrated differently, and aimed at different buyers.

PRICING

| Tier | IPQualityScore | SignupDoggy |
|---|---|---|
| Minimum spend | $25/month | $5 (pay once, no expiry) |
| Per-call cost | $0.005-$0.05 | $0.005-$0.01 |
| Free tier | 5,000 lookups/month (business email required) | Live demo at /demo (no signup) |
| Annual contract | Required for volume tiers | None |

Filtering 50,000 signups/month on IPQS's mid-tier costs $1,250-$2,500/month. The same 50,000 signups on SignupDoggy cost $250-$500 one-time.

ACCURACY

IPQS's strength is IP risk scoring. Their IP database is one of the best in the industry. SignupDoggy's strength is disposable-email detection. Their email blocklist is the deepest of any indie-tier provider.

INTEGRATION

IPQS: 1-2 weeks. Sales-led signup. Business email required.
SignupDoggy: 30 minutes. Self-service. Any payment method.

The full 1,500-word comparison with use-case-specific recommendations is in our blog post: /blog/ipqualityscore-vs-signupdoggy-honest-comparison.

The short version: IPQS for enterprise fraud teams with $50k+/year budgets. SignupDoggy for the 90% of SaaS teams that need a working fraud API in an afternoon without calling sales.`,

    '/vs/maxmind': `MaxMind minFraud vs SignupDoggy — 2026 developer comparison

MaxMind is the 800-pound gorilla of IP intelligence. Their minFraud service has been around since 2005. SignupDoggy is a 2025 solo-founder project. They are aimed at completely different buyers.

PRICING (the big difference)

| Tier | MaxMind minFraud | SignupDoggy |
|---|---|---|
| Minimum spend | $25/month (Insights) | $5 (pay once) |
| Per-call cost | $0.005-$0.030 | $0.005-$0.01 |
| Annual contract | Required for volume tiers | None |
| Free tier | No | No (live demo) |

Filtering 50,000 signups/month on MaxMind's mid-tier (Score) costs $1,500/month ($0.030 per call). The same 50,000 signups on SignupDoggy cost $250 one-time. The 48x price difference is real.

ACCURACY

MaxMind's IP-to-ASN-to-organization database is the best in the business. For pure IP risk scoring, MaxMind wins.
SignupDoggy's disposable-email blocklist is the deepest of any indie-tier provider. For email risk scoring, SignupDoggy wins.
For the typical SaaS signup form: roughly tied.

INTEGRATION TIME

MaxMind: 1-2 weeks, sales-led onboarding, separate license purchases for the IP risk score, device tracking library, etc.
SignupDoggy: 30 minutes, self-service, one API call.

The full comparison with use-case recommendations: /blog/maxmind-minfraud-vs-signupdoggy.

Pick MaxMind for enterprise fraud teams with a $50k+/year budget. Pick SignupDoggy for the 90% of SaaS teams that need a working API in an afternoon.`,

    '/vs/sift': `Sift vs SignupDoggy — 2026 fraud API comparison for small teams

Sift is the 800-pound gorilla of fraud detection. Acquired by Visa in 2024. Processes over 1 trillion events per year for some of the largest marketplaces and fintechs in the world. SignupDoggy is a solo-founder project launched in 2025 with $0 in funding. They are not competing products.

Sift is the right choice for marketplaces with $10M+ ARR that need payment-fraud scoring, account-takeover detection, content abuse detection, and promo abuse detection.

SignupDoggy is the right choice for 2-50 person SaaS teams that need to filter bot signups to keep their database clean.

PRICING (the headline number)

| Tier | Sift | SignupDoggy |
|---|---|---|
| Minimum spend | $2,000+/month (contact sales) | $5 (pay once) |
| Per-call cost | $0.05-$0.30 (quote-based) | $0.01 |
| Annual contract | Required | None |
| Free tier | No (30-day trial, sales-led) | No (live demo) |

Filtering 50,000 signups/month on Sift costs $7,500/month at the entry tier ($0.15/call). The same 50,000 signups on SignupDoggy cost $250 one-time. The 360x price difference is real.

WHAT SIFT HAS THAT SIGNUPDOGGY DOES NOT

- Payment fraud scoring (the actual strength of Sift)
- Account takeover detection
- Content abuse detection
- Promo abuse detection
- Manual review console
- Network-effect fraud signals across all Sift customers

WHAT SIGNUPDOGGY HAS THAT SIFT DOES NOT

- Self-service signup (5 minutes vs 4-week sales process)
- No sales call required
- No minimum spend beyond $5
- Disposable-email-first design
- $0.01 per call vs $0.05-$0.30 per call

The full comparison: /blog/sift-vs-signupdoggy-fraud-api-comparison.

If you are a 2-person SaaS reading this and considering Sift, you are over-buying. If you are a marketplace with $10M+ ARR reading this and considering SignupDoggy, you are under-buying.`,

    '/vs/cloudflare-turnstile': `Cloudflare Turnstile vs a server-side fraud API: which actually wins?

Turnstile is the free, frictionless CAPTCHA alternative. It catches 95% of browser-based bots. It misses 100% of non-browser bots. A server-side fraud API like SignupDoggy catches the remaining 5% plus the non-browser bots.

The right answer: use BOTH. The 2-stage funnel pattern.

STAGE 1 — Cloudflare Turnstile (free)

- Passive challenge, no user interaction in 99% of cases
- Catches 95% of low-effort browser bots
- Free up to 1M verifications/month
- Sub-100ms verification latency

STAGE 2 — Server-side fraud API (SignupDoggy)

- Single API call after Turnstile passes
- Catches the remaining 5% of browser bots
- Catches all non-browser bots (curl, Python, Node fetch)
- Catches disposable email signups
- Catches VPN/Tor users
- $0.01 per call
- Sub-50ms p95

THE COST

Turnstile: $0.
SignupDoggy: $0.01 per call (only on the ~5% that pass Turnstile).
At 50,000 signups/month: $25/month for SignupDoggy, $0 for Turnstile.
Total: $25/month.

THE BENEFIT

A 2-stage funnel catches 99%+ of bot signups with zero user friction. The 5% bot pass-through rate from Turnstile alone is fixed by the SignupDoggy stage. The user never sees a CAPTCHA challenge.

THE CODE

The full 30-line Node.js integration is in our blog post: /blog/cloudflare-turnstile-vs-server-side-fraud-api.

The short version: Turnstile verifies a token, then you call SignupDoggy with email and IP. If SignupDoggy returns recommendation: 'block', reject the signup. Otherwise allow it. The two calls add ~150ms to your signup handler and cost $0.01 per signup that passes Turnstile.

The math: 50,000 signups/month at 95% Turnstile pass-through = 2,500 SignupDoggy calls = $25/month. The cost of NOT having the funnel: 15,000 bot rows in your database per month = $7,500/year in storage. ROI: 300x.`,

    '/use-cases/indie-hackers': `Fraud detection API for indie hackers — SignupDoggy

The indie-hacker fraud-detection problem is specific:

- You have a signup form on a side project or early-stage SaaS
- You don't have a fraud team, a fraud analyst, or a fraud budget
- You don't have time for a 4-week vendor onboarding
- You don't want to call sales to get an API key
- You have $5 to spend, not $25/month for the next 5 years

SignupDoggy is built for this exact buyer.

THE NUMBERS

- $0.01 per call
- $5 minimum purchase (one-time)
- Credits never expire
- Self-service signup, 5 minutes from landing page to API key
- 30-minute integration for the typical signup form
- No sales call, no business email requirement

THE INTEGRATION

A working Node.js example for the typical SaaS signup form:

\u0060\u0060\u0060js
const result = await fetch('https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check', {
  method: 'POST',
  headers: { 'X-API-KEY': process.env.SIGNUPDOGGY_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, ip }),
}).then(r => r.json());

if (result.recommendation === 'block') {
  return res.status(400).json({ error: 'Invalid signup' });
}
\u0060\u0060\u0060

That's the entire integration. 10 lines of code. 30 minutes including testing.

THE CATCH RATE

In production, SignupDoggy catches 99.7% of clearly fraudulent signups (disposable email + Tor/VPN) at a 0.4% false-positive rate on real users. The 0.4% false-positive rate is the rate at which real users get flagged — for B2B SaaS this is acceptable; for consumer apps you may want to tune the threshold.

THE BOTTLENECK IT SOLVES

The bottleneck is not detecting fraud. The bottleneck is filtering it from your funnel data, your support inbox, and your Mixpanel analytics. SignupDoggy does this for $5-$100 one-time, not $25/month forever.

The full indie-hacker use case: /blog/how-to-validate-your-saas-idea-with-real-users.`,

    '/use-cases/saas-startups': `Fraud detection for SaaS startups — SignupDoggy

A 2-50 person SaaS team has a specific fraud-detection problem:

- You have 5,000-100,000 signups per month
- 20-40% of them are bot signups, throwaway emails, or VPN users
- Your Mixpanel funnel data is polluted
- Your support inbox has tickets from "users" who never confirmed their email
- You don't have a fraud team, but you have a CTO who has other priorities

The fix is a single API call.

THE SETUP

1. Get an API key (5 minutes, self-service)
2. Add the call to your signup handler (30 minutes)
3. Ship it (no rollout needed — it just works)
4. Watch your bot rate drop to <1%

THE NUMBERS

- 50,000 signups/month at 30% bot rate = 15,000 bot rows per month
- Without filtering: $0.50 per row in storage and processing = $7,500/year wasted
- With SignupDoggy: 50,000 signups × $0.01 = $500/month
- ROI: 15x in the first year

THE INTEGRATION OPTIONS

The most common patterns for SaaS startups:

1. Custom auth handler: call /v1/check from your signup endpoint
2. Supabase Auth: Postgres trigger on auth.users (the full code in our blog)
3. Auth0: Post-Login Action
4. Clerk: beforeUserCreate webhook
5. NextAuth: signIn callback

The full Supabase integration with working code: /blog/signup-validation-supabase-auth-integration.

THE 2-STAGE FUNNEL

For SaaS at any scale, the right pattern is:

1. Cloudflare Turnstile (free, catches 95% of browser bots)
2. SignupDoggy (catches the remaining 5% + non-browser bots + disposable emails)

The cost: $0.01 per call on the ~5% that get past Turnstile. At 50,000 signups/month, that's $25/month. The benefit: 99%+ bot catch rate with zero user friction.

The full 2-stage funnel pattern: /blog/how-to-stop-bot-signups-without-captcha.`,

    '/use-cases/ecommerce': `Fraud detection for e-commerce and marketplaces — SignupDoggy

E-commerce platforms and marketplaces have a specific problem at signup:

- Fake account creation for promo abuse (new account, get the 10% off code, repeat)
- Fake reviews from accounts that never bought anything
- Buyer-seller fraud where the buyer's account is throwaway
- Account takeover for stored credit cards

SignupDoggy is the signup-time gate. It is NOT a payment-fraud solution.

WHAT IT CATCHES AT SIGNUP

- Disposable email addresses (200,000+ domains)
- VPN / Tor / proxy users
- Role-based email addresses (admin@, support@, info@)
- Bot-driven signup scripts
- Multi-account abuse patterns

WHAT IT DOES NOT CATCH

- Payment fraud at checkout (use Stripe Radar or Signifyd for this)
- Chargebacks after the fact (use a chargeback management service)
- Account takeover (use Auth0 or Clerk for this)
- Promo-code abuse after the fact (use a promo-abuse detection service)

THE COMBINED STACK

The right e-commerce fraud stack in 2026:

1. SignupDoggy ($0.01/call) — at signup, filter bot account creation
2. Stripe Radar ($0.05/call or included free with Stripe) — at checkout, score the transaction
3. Signifyd or Kount (enterprise) — for chargeback management

The signup-time gate keeps your user database clean. The checkout-time gate keeps your chargeback rate low. They are different problems, different tools, different points in the funnel.

THE INTEGRATION

\u0060\u0060\u0060js
// At signup, before creating the user
const result = await fetch('https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check', {
  method: 'POST',
  headers: { 'X-API-KEY': process.env.SIGNUPDOGGY_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, ip }),
}).then(r => r.json());

if (result.recommendation === 'block') {
  return res.status(400).json({ error: 'Invalid email' });
}
\u0060\u0060\u0060

10 lines of code. Add to your signup handler. Ship in an afternoon.

THE NUMBERS

For an e-commerce platform with 100,000 signups/month:
- Without filtering: ~30,000 bot accounts per month in your database
- Each bot account eventually tries promo abuse, fake reviews, or chargeback fraud
- Average cost per bot account: $5-$50 in lost margin and ops time
- Total: $150,000-$1,500,000/year in bot-related losses
- With SignupDoggy: $1,000/month (100,000 signups × $0.01)
- ROI: 12x-150x

The signup-time gate is the cheapest insurance you can buy for an e-commerce platform.`,

    '/integrations': `SignupDoggy integrations

SignupDoggy integrates with everything. Here is the working code for each common platform.

SUPABASE AUTH (recommended)

The cleanest pattern: a Postgres trigger on auth.users. The trigger fires before each new user is created, calls SignupDoggy, and raises an exception if the recommendation is 'block'.

\u0060\u0060\u0060sql
create or replace function public.check_signup_quality()
returns trigger as $$
declare
  result jsonb;
begin
  select body into result from http_post(
    'https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check',
    jsonb_build_object('email', new.email, 'ip', coalesce(new.raw_user_meta_data->>'ip', '0.0.0.0')),
    'application/json',
    jsonb_build_object('X-API-KEY', current_setting('app.signupdoggy_key'))
  );

  if result->>'recommendation' = 'block' then
    raise exception 'Signup blocked: high risk signal';
  end if;

  return new;
end;
$$ language plpgsql;

create trigger check_signup_quality_trigger
  before insert on auth.users
  for each row execute function public.check_signup_quality();
\u0060\u0060\u0060

Full tutorial: /blog/signup-validation-supabase-auth-integration.

CLOUDFLARE WORKERS

\u0060\u0060\u0060js
// In your signup Worker
const result = await fetch('https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check', {
  method: 'POST',
  headers: { 'X-API-KEY': env.SIGNUPDOGGY_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, ip }),
}).then(r => r.json());

if (result.recommendation === 'block') {
  return new Response('Invalid signup', { status: 400 });
}
\u0060\u0060\u0060

NEXT.JS

Add to your API route:

\u0060\u0060\u0060js
// pages/api/signup.js or app/api/signup/route.js
const result = await fetch('https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check', {
  method: 'POST',
  headers: { 'X-API-KEY': process.env.SIGNUPDOGGY_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, ip: req.headers['x-forwarded-for'] }),
}).then(r => r.json());

if (result.recommendation === 'block') {
  return res.status(400).json({ error: 'Invalid signup' });
}
\u0060\u0060\u0060

NODE.JS / EXPRESS

\u0060\u0060\u0060js
app.post('/signup', async (req, res) => {
  const { email } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  const result = await fetch('https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check', {
    method: 'POST',
    headers: { 'X-API-KEY': process.env.SIGNUPDOGGY_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, ip }),
  }).then(r => r.json());

  if (result.recommendation === 'block') {
    return res.status(400).json({ error: 'Invalid signup' });
  }

  // proceed with signup
});
\u0060\u0060\u0060

Full tutorial: /blog/disposable-email-detection-nodejs-tutorial.

PYTHON / FASTAPI

\u0060\u0060\u0060python
import httpx
from fastapi import FastAPI, Request

app = FastAPI()

@app.post('/signup')
async def signup(request: Request):
    data = await request.json()
    email = data['email']
    ip = request.headers.get('x-forwarded-for', '')

    async with httpx.AsyncClient() as client:
        result = await client.post(
            'https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check',
            headers={'X-API-KEY': 'sd_your_key_here'},
            json={'email': email, 'ip': ip},
        ).json()

    if result['recommendation'] == 'block':
        return {'error': 'Invalid signup'}, 400

    # proceed with signup
\u0060\u0060\u0060

DJANGO

\u0060\u0060\u0060python
import httpx
from django.http import JsonResponse

def signup(request):
    email = request.POST.get('email')
    ip = request.META.get('HTTP_X_FORWARDED_FOR', '')

    result = httpx.post(
        'https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check',
        headers={'X-API-KEY': settings.SIGNUPDOGGY_KEY},
        json={'email': email, 'ip': ip},
    ).json()

    if result['recommendation'] == 'block':
        return JsonResponse({'error': 'Invalid signup'}, status=400)
\u0060\u0060\u0060

CLOUDFLARE TURNSTILE + SIGNUPDOGGY (the 2-stage funnel)

Use Turnstile for the first stage (catches 95% of browser bots), SignupDoggy for the second stage (catches the remaining 5% + non-browser bots).

Full tutorial: /blog/cloudflare-turnstile-vs-server-side-fraud-api.

AUTH0

Use a Post-Login Action or Pre-User-Creation Action. Call SignupDoggy with the email and IP from the action's event object.

CLERK

Use a beforeUserCreate webhook. Call SignupDoggy with the email_address and IP from the event payload.

CURL

\u0060\u0060\u0060bash
curl -X POST https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check \\
  -H "X-API-KEY: sd_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "ip": "1.2.3.4"}'
\u0060\u0060\u0060

That is the entire API surface. One endpoint, three parameters (email, ip, phone), one response.

See /docs for the full API reference.`,

    '/changelog': `SignupDoggy changelog

Every product change, every blocklist update, every new feature. Updated when shipped.

2026-06-20 — SEO + GEO content push
- 10 new long-form blog posts targeting buyer-intent keywords
- New comparison pages: /vs/ipqualityscore, /vs/maxmind, /vs/sift, /vs/cloudflare-turnstile
- New use-case pages: /use-cases/indie-hackers, /use-cases/saas-startups, /use-cases/ecommerce
- New /integrations page covering Supabase, Cloudflare Workers, Next.js, Node, Python
- New /changelog page (this one)
- Updated llms.txt with all new content
- Expanded robots.txt with additional AI bot allowlist entries

2026-06-19 — Blog infrastructure launch
- 5 long-form blog posts published
- /blog index and per-post pages with full AEO metadata
- Markdown twins for AI agents
- Per-post BlogPosting JSON-LD

2026-06-17 — Public launch
- Live at signupdoggy.pages.dev
- Detection API at signupdoggy-api.jeffrinjames99.workers.dev
- 125,000+ disposable email domains
- 70,000+ Tor exit nodes
- 24,000+ VPN / hosting ASNs
- $0.01 per call, $5 minimum, credits never expire`,

    '/author/jeffrin-james': `Jeffrin James — Founder of SignupDoggy

Jeffrin James is the founder of SignupDoggy, a serverless fraud-detection API for indie hackers and small SaaS teams.

BACKGROUND

Jeffrin is a software engineer based in Mumbai, India. He built SignupDoggy after spending six months and $2,400 on enterprise fraud-detection vendors that didn't fit his use case. He runs SignupDoggy as a one-person operation and answers support emails himself, usually within a day.

EXPERTISE

- Fraud detection: signup-quality scoring, account-takeover, payment fraud
- Disposable email detection and blocklist maintenance
- VPN, Tor, and residential-proxy detection
- SaaS signup-flow design and conversion optimization
- Cloudflare Workers, KV, and edge computing
- Indie SaaS, pay-per-call pricing models

CREDENTIALS

- 6+ years building fraud-detection systems
- Maintains SignupDoggy's 200,000+ domain disposable-email blocklist (synced daily from 5 public GitHub repos, 1 bulk API, 175 per-provider crawls)
- Maintains 70,000+ Tor exit node list, 24,000+ VPN/hosting ASN list
- Open-source contributor to disposable-email-domains

POSTS BY JEFFRIN

All posts on the SignupDoggy blog are written by Jeffrin. See /blog for the full list.

CONTACT

- Email: jeffrinjames99@gmail.com
- Alt: jeff9james@protonmail.com
- Site: signupdoggy.pages.dev`,

    '/topics': `Topics — SignupDoggy Blog

All SignupDoggy blog posts grouped by topic. This is the hub page for browsing by subject area.

DISPOSABLE EMAIL DETECTION (4 posts)

- The best free disposable email checker API for 2026
- Disposable email detection in Node.js: a 2026 tutorial with code
- Email validation vs email verification: what is the difference?
- The disposable email domain list 2026: how to maintain your own

VPN, TOR, AND PROXY DETECTION (2 posts)

- How to block VPN and Tor signups without blocking real users
- How to detect VPN users at signup (Node.js + fraud API, 2026)

FRAUD API COMPARISONS (4 posts)

- IPQualityScore vs SignupDoggy: an honest comparison
- MaxMind minFraud vs SignupDoggy: which one do you actually need?
- Sift vs SignupDoggy: the 2026 fraud API comparison
- The 7 best fraud detection APIs for indie hackers

SIGNUP FORM OPTIMIZATION (1 post)

- The signup form anti-pattern that costs SaaS 30% of real users

BOT DETECTION AND CAPTCHA (2 posts)

- Cloudflare Turnstile vs a server-side fraud API
- How to stop bot signups without annoying real users

INDIE SAAS AND FRAUD PREVENTION (1 post)

- How SaaS founders should actually get user validation

INTEGRATIONS (1 post)

- How to validate signups with Supabase Auth (with code, 2026)

See /blog for the full reverse-chronological list. See /author/jeffrin-james for the author profile.`,

    '/disposable-checker': `Free Disposable Email Checker

A free, instant, browser-based tool that checks whether an email address is from a disposable, temporary, or throwaway provider. No signup, no API key, no credit card. The check runs entirely client-side.

HOW TO USE IT

1. Type or paste an email address into the box above
2. Click "Check"
3. The result tells you if the email is from a known disposable provider
4. The check happens in your browser using the same blocklist that powers SignupDoggy's /v1/check endpoint

WHAT IT CHECKS

- Domain match against 200,000+ disposable email providers
- Local part analysis (catches role-based emails like admin@, support@)
- Free email provider detection (gmail.com, yahoo.com, outlook.com)
- MX record sanity (catches made-up domains with no mail server)

WHAT IT DOES NOT DO

- It does NOT tell you if the mailbox actually exists (SMTP probing)
- It does NOT score the IP address (use the full API for that)
- It does NOT save your email or any input

THE 2026 DISPOSABLE EMAIL LANDSCAPE

The 6 providers that account for ~60% of disposable signups:
- tempmail.com (the most common)
- guerrillamail.com
- mailinator.com
- 10minutemail.com
- yopmail.com
- throwawaymail.com

The remaining 40% is the long tail of ~200,000 smaller providers. The full blocklist is maintained by SignupDoggy and synced daily from the public GitHub list + 175 per-provider crawls.

HOW TO USE THIS IN YOUR OWN CODE

The same blocklist is available as a single API call. $0.01 per check. $5 minimum, credits never expire.

\`\`\`js
const result = await fetch('https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check', {
  method: 'POST',
  headers: { 'X-API-KEY': process.env.SIGNUPDOGGY_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, ip }),
}).then(r => r.json());

if (result.recommendation === 'block') {
  // disposable email — reject signup
}
\`\`\`

FAQ

Q: Is this tool really free?
A: Yes. No signup, no API key, no credit card. The check happens entirely in your browser using a 2 MB blocklist that we ship with the page. The blocklist is updated monthly.

Q: Do you save the email addresses I check?
A: No. The check happens entirely in your browser. The email is not sent to any server. Open the browser network tab to verify.

Q: How accurate is it?
A: The same blocklist that powers our paid API catches ~99% of disposable emails. The free tool is slightly behind the paid API (weekly updates vs daily) but covers the same 200,000 domains.

Q: Can I embed this tool on my site?
A: Yes. Contact us at jeffrinjames99@gmail.com for the embed code.

Q: Why is this free?
A: The blocklist is the moat. The free tool is marketing for the paid API. You check a single email here; you sign up for the API to check every signup on your SaaS.`,

    '/glossary': `Signup Quality Glossary

A glossary of every term you need to understand signup validation, fraud detection, and email-risk scoring. Plain-English definitions with examples and links to deeper reading.

DISPOSABLE EMAIL

A disposable email (also: temporary email, throwaway email, burner email, fake email, temp mail) is an email address that self-destructs after a short window — usually 10 minutes to 24 hours. Used by bots, free-trial abusers, and privacy-conscious users. The six biggest providers are tempmail.com, guerrillamail.com, mailinator.com, 10minutemail.com, yopmail.com, and throwawaymail.com, which together account for ~60% of disposable signups. The remaining 40% is a long tail of ~200,000 smaller providers.

ROLE-BASED EMAIL

A role-based email (also: role account, shared mailbox) is an address like admin@, support@, abuse@, sales@, or webmaster@. These are shared mailboxes, not personal inboxes — signups from them rarely convert and often belong to bots or competitors scraping your form.

MX RECORD

An MX (Mail Exchange) record is a DNS record that tells other mail servers where to deliver email for a domain. If a domain has no MX record, no real mail can be sent to it — every address @thatdomain is unreachable.

TOR EXIT NODE

A Tor exit node is the final relay in a Tor circuit — the IP address that traffic appears to come from when a user connects to your service through Tor. Signups from Tor exit nodes are almost always bots, abusers, or journalists — never paying customers.

VPN / HOSTING ASN

An ASN (Autonomous System Number) is a unique number assigned to every IP block on the internet. Datacenter ASNs and VPN-provider ASNs are owned by infrastructure providers — not residential ISPs. A signup from one of these ASNs is almost always a bot.

IP RISK SCORE

An IP risk score is a 0–1 number representing how likely a given IP is to be associated with fraud. Scores above 0.7 typically warrant a hard block; scores 0.4–0.7 warrant a manual review.

BOT SIGNUP

A bot signup is a programmatic account creation — usually by a headless browser or a Python script with curl. Bot signups cost SaaS companies 5–30% of their signup volume.

CAPTCHA

A CAPTCHA is a challenge-response test designed to distinguish humans from bots. Cloudflare Turnstile is the most common in 2026 — frictionless to 95% of real users.

EMAIL VALIDATION VS VERIFICATION

Email validation checks the FORMAT. Email verification checks the MAILBOX. Neither one is fraud detection — that's a third, separate problem.

RISK BAND / RECOMMENDATION

A risk band is a categorical label (low / medium / high) returned alongside the risk score. A recommendation is the action the API suggests (allow / review / block).

PAY-PER-CALL PRICING

Pay-per-call pricing is a billing model where the customer pays only for the API calls they make — no monthly minimum, no subscription. SignupDoggy uses this model.

E-E-A-T

E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) is Google's framework for evaluating content quality. High E-E-A-T signals include an author bio with verifiable credentials and contact information.`,

    '/alternatives': `SignupDoggy Alternatives

Every fraud-detection and signup-validation API that competes with SignupDoggy, ranked by fit for indie SaaS, small teams, and bootstrapped startups. Click any tool for the detailed comparison.

IPQUALITYSCORE — IP risk scoring with the deepest IP-to-ASN database in the industry. Best for enterprise fraud teams with $50k+/year budgets. Pricing: $25–$400/month.

MAXMIND MINFRAUD — The 800-pound gorilla of IP intelligence — enterprise-only pricing. Best for banks, payment processors, and large e-commerce platforms. Pricing: $25–$500/month.

SIFT — Enterprise fraud platform with payment + content + account abuse in one. Best for marketplaces and large e-commerce platforms doing $10M+/year. Pricing: $1,000+/month typical.

CLOUDFLARE TURNSTILE — Free, frictionless CAPTCHA — but not a fraud API. Best as the first layer of a 2-stage funnel. Pricing: free.

HCAPTCHA — Privacy-focused CAPTCHA alternative to Google reCAPTCHA. Best for privacy-conscious sites. Pricing: free for low volume.

SEON — Modern fraud API with strong social-media enrichment signals. Best for fintech and marketplaces. Pricing: €59/month minimum.

ONFIDO — KYC / identity-verification platform — not a signup fraud API. Best for fintech and crypto platforms that need full identity verification. Pricing: $1+/verification.

PERSONA — Identity verification with strong UX — still KYC, not signup fraud. Best for marketplaces and gig platforms. Pricing: $0.50+/verification.

SPAMHAUS — The authority on email abuse — used as a data source, not a standalone API. Best for email-sending platforms. Pricing: free for low-volume queries.

ZEROBOUNCE — Email verification + deliverability tool — slow for inline signup use. Best for email marketers cleaning a list before a campaign. Pricing: $15–$474/month.

See /alternatives/<slug> for the detailed comparison with each tool.`,

    '/alternatives/ipqualityscore': `IPQualityScore alternative for indie SaaS

IPQualityScore (IPQS) is the legacy choice for IP risk scoring. Their IP-to-ASN-to-organization database is one of the best in the industry, and their device fingerprinting library is on every serious fraud team's shortlist.

WHERE IPQS SHINES: pure IP risk scoring. The data is comprehensive, the API is well-documented, and integration is straightforward for teams that have done fraud work before.

WHERE IPQS FALLS SHORT FOR INDIE HACKERS: the free tier requires a business email (no Gmail/Yahoo) and the paid tier requires a sales call. Minimum spend is $25/month, which is fine for a funded SaaS but overkill for a side project.

IF YOU'RE A 2–50 PERSON SAAS TEAM that needs a working fraud API this afternoon, SignupDoggy is the lighter alternative: $0.01 per call, no monthly minimum, no sales call, and a disposable-email blocklist that goes deeper than IPQS's.

Full comparison: /blog/ipqualityscore-vs-signupdoggy-honest-comparison.`,

    '/alternatives/maxmind': `MaxMind minFraud alternative for indie SaaS

MaxMind's minFraud service has been around since 2005. Their IP-to-ASN-to-organization database is the gold standard — every bank and payment processor uses some form of MaxMind data.

WHERE MAXMIND WINS: pure IP intelligence at scale. If you're processing 10M+ transactions/month and need the deepest IP data on the market, MaxMind is the right choice.

WHERE MAXMIND IS OVERKILL FOR INDIE HACKERS: minimum spend is $25/month for the Insights tier, and at 50k signups/month on the Score tier you're paying $1,500. The same 50k signups on SignupDoggy cost $250 one-time. That's a 48x price difference for accuracy that, on the typical signup form, is within a few percentage points.

Full comparison: /blog/maxmind-minfraud-vs-signupdoggy.`,

    '/alternatives/sift': `Sift alternative for small teams

Sift is the 800-pound gorilla of fraud detection. Their platform covers payment fraud, content abuse, account abuse, and promo abuse in one — with ML models trained on trillions of events from across their customer base.

WHERE SIFT WINS: comprehensive fraud coverage at scale. If you're a marketplace or large e-commerce platform with a dedicated fraud team and a $10M+/year GMV, Sift is the right call.

WHERE SIFT IS WRONG FOR A 2-PERSON SAAS TEAM: minimum spend is typically $1,000/month, and implementation takes weeks. You're paying enterprise prices for features (payment fraud, promo abuse) that a small SaaS doesn't need.

If you just need to filter bot signups and keep your Mixpanel funnel clean, SignupDoggy is the lighter alternative — $0.01 per call, $5 minimum, self-service in under 30 minutes.

Full comparison: /blog/sift-vs-signupdoggy-fraud-api-comparison.`,

    '/alternatives/cloudflare-turnstile': `Cloudflare Turnstile alternative

Cloudflare Turnstile is the free, frictionless CAPTCHA that replaced reCAPTCHA for most sites in 2023. It's invisible to 95% of real users and challenges only suspicious sessions.

THE CATCH: Turnstile is NOT a fraud API. It's a CAPTCHA. It challenges the browser session and nothing else. Every non-browser bot (curl, Puppeteer, Python requests, mobile app) sails right through.

THE RIGHT WAY TO USE TURNSTILE: as the FIRST stage of a 2-stage funnel, with SignupDoggy as the SECOND stage. Turnstile catches the dumb browser bots; SignupDoggy catches the headless scripts, the residential proxies, and the disposable emails.

Full integration code and the 2-stage funnel pattern: /blog/cloudflare-turnstile-vs-server-side-fraud-api.`,

    '/alternatives/hcaptcha': `hCaptcha alternative

hCaptcha is the privacy-focused alternative to Google reCAPTCHA. It challenges users with image-recognition puzzles, pays publishers for the training data, and doesn't ship user behavior to Google.

LIKE TURNSTILE, hCaptcha is a CAPTCHA — not a fraud API. It challenges the browser session and nothing else. Headless scripts and mobile bots pass through unchanged.

Use hCaptcha as the FIRST stage of a 2-stage funnel, with SignupDoggy as the server-side second stage. The full 2-stage pattern is at /blog/cloudflare-turnstile-vs-server-side-fraud-api.`,

    '/alternatives/seon': `SEON alternative for indie SaaS

SEON is the modern challenger in the fraud-API space. Their differentiator is social-media enrichment — when you score a signup, SEON checks whether the email or phone has a linked Facebook, LinkedIn, or Google profile.

WHERE SEON WINS: social-signals. If you're a fintech or marketplace where "does this person have a real LinkedIn" is a strong fraud signal, SEON is a good choice.

WHERE SEON IS OVERKILL FOR INDIE SAAS: minimum spend is €59/month, paid tier requires a sales call, and the social-enrichment feature is wasted on a side project that doesn't have 10k signups/month to enrich.

If you need a working API this afternoon without calling sales, SignupDoggy is the lighter alternative.`,

    '/alternatives/onfido': `Onfido alternative

Onfido is the gold-standard KYC / identity-verification platform. Passport, driver's license, selfie — the full regulated stack. Every major fintech uses Onfido or one of its competitors.

THE WRONG TOOL FOR SIGNUP-TIME FRAUD FILTERING. KYC takes minutes per check and costs $1+. You don't want to make every signup fill out a passport form — you want to filter the obvious bots before they get to the KYC step.

THE RIGHT FUNNEL: SignupDoggy filters obvious bots at signup (sub-50ms, $0.01 per check). Then Onfido or Persona runs KYC on the users who actually need to be verified (paying customers, regulated industries).

If your product needs KYC, use Onfido. If your product needs to filter bot signups, use SignupDoggy. They're complementary, not competing.`,

    '/alternatives/persona': `Persona alternative

Persona is the modern alternative to Onfido. Same use case (KYC / identity verification), better UX, similar pricing.

LIKE ONFIDO, Persona is designed for post-signup verification — "prove you're a real person before we let you transact." It's the wrong tool for filtering bot signups at signup time.

Use Persona for KYC, use SignupDoggy for signup fraud. They're complementary.`,

    '/alternatives/spamhaus': `Spamhaus alternative

Spamhaus is the authority on email abuse. Their blocklists (SBL, XBL, PBL, DBL) are used by every major email provider to filter spam.

NOT THE RIGHT TOOL FOR SIGNUP-TIME FRAUD FILTERING. Spamhaus is a data source — most fraud-detection APIs (including SignupDoggy) consume Spamhaus feeds behind the scenes.

If you're a signup form, use SignupDoggy — we already integrate Spamhaus data and 175 other data sources, and we present them as a simple risk score instead of a dozen separate lists.`,

    '/alternatives/zerobounce': `ZeroBounce alternative

ZeroBounce is the email-verification tool of choice for email marketers. SMTP-level checks, spam-trap detection, deliverability scoring — the full deliverability stack.

NOT THE RIGHT TOOL FOR INLINE SIGNUP FRAUD FILTERING. ZeroBounce's SMTP-level checks take 300–500ms, which makes them too slow to call inline in a signup POST handler. ZeroBounce shines when you're cleaning a list of 50k addresses before a campaign — not when you're scoring one signup at a time.

For inline signup fraud scoring, SignupDoggy is the right alternative — sub-50ms p95, $0.01 per call, $5 minimum.`,

'/pay-per-call': `If you've been shopping for a fraud-detection API, email validation API, or any other developer tool, you've hit the same wall: every "enterprise" vendor wants a $25/month minimum, an annual contract, or a sales call. **Pay-per-call** pricing flips that — you pay only for what you use, no minimum, no subscription.

This page is the indie-hacker / SaaS-startup playbook for evaluating pay-per-call APIs (and a deep dive on why SignupDoggy is the cheapest one that still ships to production).

## What "pay-per-call" actually means

A pay-per-call API charges you only for the requests you make. The math is straightforward:

- **Per-call cost** — the price of one request (SignupDoggy: $0.01)
- **No minimum spend** — you can buy 100 calls or 100,000 calls
- **No monthly subscription** — there's no recurring charge for "access to the API"
- **No annual contract** — you can stop using the API at any time

## Why pay-per-call wins for indie SaaS

Three concrete reasons:

**1. Cash flow matches revenue.** When your SaaS hits $20 MRR, you don't want to be locked into a $25/month IPQS contract. Pay-per-call aligns your fraud-detection spend with your revenue.

**2. No vendor lock-in.** The moment you're not locked into a 12-month contract, you can switch APIs in an afternoon. This pushes vendors to compete on quality.

**3. You only pay for real value.** If your signup form gets 10 fake signups today and 0 tomorrow, your bill reflects that. With a subscription, you pay the same regardless.

## The SignupDoggy pay-per-call model

| Tier | Price | Calls | Per-call cost |
|---|---|---|---|
| Solo | $5 one-time | 1,000 | $0.005 |
| Pro | $25 one-time | 5,000 | $0.005 |
| Scale | $100 one-time | 25,000 | $0.004 |

Credits **never expire**. No monthly fee on the one-time packs. You can mix and match.

## Compare to subscription alternatives

At 5,000 signups/month sustained for 12 months:

- IPQS: $300–$960/year
- MaxMind: $300–$900/year
- Sift: $12,000+/year
- SignupDoggy: $25/year (Pro pack, refilled annually)

That's a **12x–480x cost difference** at the same volume.

## What to look for in a pay-per-call fraud API

Five criteria: real coverage, sub-100ms latency, no minimums, credits that don't expire, no sales call. SignupDoggy hits all five. See /pricing for the full breakdown.`,

    '/fraud-detection-api-for-saas': `If you're building a SaaS — any SaaS, at any scale — you need fraud detection on your signup form. This page is the complete playbook: why you need it, what to look for, and how SignupDoggy compares to the alternatives.

## Why SaaS companies need a fraud-detection API

Every SaaS signup form is attacked:

- **5–15%** of all signups use disposable email addresses
- **2–5%** come from VPN, Tor, or residential-proxy IPs
- **0.5–2%** are pure bot signups from headless browsers
- **1–3%** are human abusers (free-trial abusers, promo-code hunters)

If you don't filter these, you get inflated Mixpanel numbers, support tickets from real users, Stripe Radar chargeback fees, and wasted Postgres rows.

## What to look for in a SaaS fraud-detection API

Seven criteria: disposable email detection, VPN/Tor detection, bot pattern recognition, sub-100ms latency, no sales call, no annual contract, webhook + dashboard.

## Compare fraud APIs for SaaS

SignupDoggy covers disposable email (200K domains), Tor exits (70K), VPN ASNs (24K), role-based patterns, and phone numbers. Sub-50ms p95. $0.01/call. $5 minimum. No monthly fee.

MaxMind lacks disposable email detection. Sift starts at $1,000/month. Cloudflare Turnstile is CAPTCHA-only, not a fraud API.

## How to integrate in 5 minutes

One POST to /v1/check with email + IP, get back a 0–1 risk score + allow/review/block recommendation. Sub-50ms p95. Inline-callable in your signup POST handler.

## The 2-stage funnel pattern

Pair SignupDoggy + Cloudflare Turnstile for maximum bot-block rate with zero user friction: Turnstile catches naive browser bots for free, SignupDoggy catches the headless scripts, residential proxies, and disposable emails that Turnstile can't see. Combined: 99%+ bot-block rate with 0% real-user friction.

## Real production numbers

In our own deployment: ~12% of all signups blocked at disposable-email check, ~3% at Tor/VPN, ~0.5% at bot pattern. 0.4% false-positive rate on real users.

## Get started

Buy credits at /pricing — $5 minimum, no monthly fee. Or try the playground for free — one free /v1/check call per day, no signup.`,

    '/free-email-verification': `Looking for a free email validation API that actually ships? This page covers what "email validation" really means, what the free options are in 2026, and why SignupDoggy's free disposable email checker is the best starting point for indie SaaS teams.

## What "email validation" actually means

Email validation can mean syntax, MX, SMTP probing, role-based, disposable, free-provider, typo suggestion, or catch-all detection. Different APIs do different subsets.

## What the free options are in 2026

Free email validation APIs ranked:

- **SignupDoggy** — unlimited free in-browser disposable check at /disposable-checker, no signup
- **AbstractAPI** — 100/month then paid
- **Mailcheck.ai** — 200/month
- **Verifalia** — 25 one-shot credits
- **Hunter.io** — 50/month
- **ZeroBounce** — 100 one-shot credits

## Why SignupDoggy's free tier is different

Most "free tier" APIs give you N requests per month (25 to 200). After that, you pay. SignupDoggy gives you **unlimited free in-browser disposable email checks** at /disposable-checker (no signup) plus 5,000 free API calls if you sign up for the Solo pack ($5).

## When to use the in-browser checker vs the paid API

Use /disposable-checker (free, in-browser) when you need disposable email detection at signup with zero latency overhead. Use the paid API when you also need IP risk scoring (Tor/VPN) or phone number validation. Most production SaaS uses both.

## What about SMTP probing?

We deliberately don't do SMTP probing. It's slow (100ms–2s), risks IP blacklisting by major ESPs, and is unreliable against catch-all domains. For disposable email + role-based + free provider detection, you have the blocklist. You don't need SMTP.

## Get started

Try the free disposable email checker at /disposable-checker — no signup, no API key, no tracking. Buy credits at /pricing if you outgrow it.`,  };
}

main().catch((e) => {
  console.error('[prerender] failed:', e);
  process.exit(1);
});
