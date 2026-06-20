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
  const ogImage = config.ogImage ?? 'https://signupdoggy.pages.dev/og-image.png';
  const robots = config.noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  const allSchemas = [...(config.schemas ?? []), ...extraSchemas];

  return `
  <title>${htmlEscape(config.title)}</title>
  <meta name="description" content="${htmlEscape(config.description)}" />
  ${config.keywords ? `<meta name="keywords" content="${htmlEscape(config.keywords)}" />` : ''}
  <meta name="robots" content="${robots}" />
  <meta name="googlebot" content="${robots}" />
  <meta name="author" content="Jeffrin James" />
  <meta name="theme-color" content="#000000" />
  <link rel="canonical" href="${htmlEscape(canonical)}" />
  <link rel="alternate" type="text/plain" href="https://signupdoggy.pages.dev/llms.txt" title="llms.txt — plain-text index for AI agents" />
  <link rel="sitemap" type="application/xml" href="https://signupdoggy.pages.dev/sitemap.xml" />
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.json" />
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

async function main() {
  if (!(await fileExists(DIST))) {
    console.error(`[prerender] dist not found at ${DIST}. Run \`npm run build\` first.`);
    process.exit(1);
  }
  const shellHtml = await readFile(join(DIST, 'index.html'), 'utf8');

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
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: p.title,
          description: p.description,
          datePublished: p.date,
          dateModified: p.date,
          inLanguage: 'en-US',
          author: { '@type': 'Person', name: 'Jeffrin James', email: 'mailto:jeffrinjames99@gmail.com' },
          publisher: { '@type': 'Organization', name: 'SignupDoggy', url: 'https://signupdoggy.pages.dev', logo: { '@type': 'ImageObject', url: 'https://signupdoggy.pages.dev/android-chrome-512x512.png' } },
          mainEntityOfPage: { '@type': 'WebPage', '@id': `https://signupdoggy.pages.dev/blog/${p.slug}` },
          keywords: (p.tags || []).join(', '),
          wordCount: Math.max(1, Math.round((POST_BODIES[p.slug] || '').split(/\s+/).filter(Boolean).length)),
          url: `https://signupdoggy.pages.dev/blog/${p.slug}`,
          image: 'https://signupdoggy.pages.dev/og-image.png',
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
      ],
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

  const all = [...routeEntries, ...postEntries];
  let count = 0;
  for (const { config, body } of all) {
    if (config.path === '/auth' || config.path === '/login' || config.path === '/signup' || config.path === '/dashboard' || config.path === '/keys' || config.path === '/checkout') continue;
    const html = rewriteShell(shellHtml, config, body);
    const out = config.path === '/' ? join(DIST, 'index.html') : join(DIST, config.path, 'index.html');
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, html, 'utf8');
    count++;
    console.log(`[prerender] ${config.path} → ${out.replace(DIST + '/', '')}`);
  }
  console.log(`[prerender] wrote ${count} static HTML files.`);
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

  // Preserve the preconnect + Google Fonts link + the Vite-injected
  // JS/CSS bundle (the SPA still needs them at runtime). Snip
  // everything between <head> and </head>, drop the bits we don't
  // want, then insert the new meta block.
  const headMatch = shell.match(/<head>([\s\S]*?)<\/head>/i);
  if (!headMatch) {
    // No head — unlikely, but bail safely.
    return shell;
  }
  const headContent = headMatch[1];
  // Keep: preconnect, Google Fonts, AND the Vite bundle (JS + CSS).
  // Without the Vite bundle, the React SPA never boots and the page
  // renders blank. Match any src="/assets/..." script or
  // href="/assets/..." stylesheet, regardless of attribute order.
  const keep = [];
  const keepRe = /(<link[^>]*rel=["']?preconnect["']?[^>]*>|<link[^>]*fonts\.googleapis\.com[^>]*>|<link[^>]*href=["']?\/assets\/[^"']+\.css["']?[^>]*>|<script[^>]*src=["']?\/assets\/[^"']+\.js["']?[^>]*><\/script>)/gi;
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

8. Children's privacy. SignupDoggy is not directed at children under 13. We do not knowingly collect data from children under 13.

9. Changes. We will post any changes to this policy on this page and email active customers.

10. Contact. jeffrinjames99@gmail.com. Jeffrin James, Mumbai, India.`,
  };
}

main().catch((e) => {
  console.error('[prerender] failed:', e);
  process.exit(1);
});
