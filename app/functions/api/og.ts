// Cloudflare Pages Function — /api/og
//
// Generates per-page Open Graph images on the fly as 1200×630 SVG with
// a branded dark background, route-specific title text, and a footer
// breadcrumb. Returns image/svg+xml which all major OG consumers
// (Twitter/X, LinkedIn, Slack, Discord, Facebook, Telegram) accept
// natively since 2022. They downscale to PNG internally for share
// cards.
//
// Query params (all optional — defaults produce a service-wide card):
//   title     — main heading (max 80 chars, wraps to 2-4 lines)
//   subtitle  — subheading (max 120 chars)
//   path      — breadcrumb-style footer (e.g. "/docs")
//   badge     — top-right corner badge text (e.g. "API REF")
//
// Why SVG (not PNG)?
//   Cloudflare Pages Functions can ship npm packages via the wrangler
//   bundler, but adding a PNG encoder (pngjs, @cf-wasm/photon, etc.)
//   bloats the bundle for one endpoint. SVG is text, parses in <1ms,
//   renders identically on every platform, and is fully cacheable at
//   the edge. The visual output is the same after the consumer
//   downscales it for the share card.
//
// Caching:
//   `s-maxage=86400` + `immutable` lets Cloudflare's edge cache hold
//   the response for a day per unique URL. Browsers get a shorter
//   `max-age=3600` so you can iterate by tweaking the title text.
//
// Security:
//   Every user-supplied string is HTML-escaped before being placed in
//   the SVG. Title and subtitle lengths are hard-capped to prevent
//   pathological responses.

interface OGParams {
  title: string;
  subtitle?: string;
  path?: string;
  badge?: string;
}

const DEFAULTS = {
  title: 'SignupDoggy — Disposable Email, VPN & Tor Detection API',
  subtitle: 'One API. 1¢ per check. No monthly fee.',
  path: '/',
  badge: 'SIGNUPDOGGY',
} as const;

// Hard caps — values are silently truncated past these lengths so
// the SVG never overflows its 1200×630 viewBox.
const MAX = {
  title: 80,
  subtitle: 120,
  path: 60,
  badge: 20,
} as const;

// Escape the five XML special characters. Required for any value that
// ends up inside an SVG text node or attribute.
function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Strip HTML tags, escape XML, truncate. The "sanitize" name is
// deliberate — this is the boundary between untrusted query-string
// input and the rendered SVG.
function sanitize(raw: string, maxLen: number): string {
  return raw
    .replace(/<[^>]*>/g, '')        // strip any HTML tags
    .replace(/[\u0000-\u001F\u007F]/g, '') // strip control chars
    .slice(0, maxLen);
}

// Greedy word-wrap. Splits on whitespace, builds lines that fit
// within `maxCharsPerLine`, and caps the result at 4 lines so the
// title never overflows the viewBox. A single over-long word is
// force-broken so it can't blow out the layout either.
function wrapTitle(title: string, maxCharsPerLine = 22, maxLines = 4): string[] {
  const words = title.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    // Hard-break a single word longer than the line width.
    if (word.length > maxCharsPerLine) {
      if (current) {
        lines.push(current);
        current = '';
      }
      // Chunk the long word into maxCharsPerLine-sized pieces.
      for (let i = 0; i < word.length; i += maxCharsPerLine) {
        const chunk = word.slice(i, i + maxCharsPerLine);
        if (lines.length >= maxLines) break;
        lines.push(chunk);
      }
      continue;
    }

    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
    if (lines.length >= maxLines) break;
  }
  if (current && lines.length < maxLines) lines.push(current);

  // If we ran out of room mid-word, append an ellipsis to the last
  // line so callers know there was more.
  if (lines.length === maxLines) {
    const last = lines[lines.length - 1];
    if (last.length > maxCharsPerLine - 1) {
      lines[lines.length - 1] = last.slice(0, maxCharsPerLine - 1) + '…';
    } else {
      lines[lines.length - 1] = last + '…';
    }
  }

  return lines.slice(0, maxLines);
}

// Build the full SVG string. Pure template — no DOM, no Canvas.
function renderSVG(params: OGParams): string {
  const title = sanitize(params.title || DEFAULTS.title, MAX.title);
  const subtitle = sanitize(params.subtitle || '', MAX.subtitle);
  const path = sanitize(params.path || DEFAULTS.path, MAX.path);
  const badge = sanitize(params.badge || DEFAULTS.badge, MAX.badge);

  const titleLines = wrapTitle(title);
  const titleYStart = 280;
  const titleLineHeight = 78;
  const subtitleY = titleYStart + titleLines.length * titleLineHeight + 30;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0a0a"/>
      <stop offset="50%" stop-color="#1a1a1a"/>
      <stop offset="100%" stop-color="#000000"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>

  <!-- Top border accent -->
  <rect x="0" y="0" width="1200" height="6" fill="#3ecf8e"/>

  <!-- Logo block (top-left) -->
  <g transform="translate(60, 60)">
    <rect x="0" y="0" width="56" height="56" fill="#3ecf8e" rx="4"/>
    <text x="28" y="38" text-anchor="middle" fill="#000" font-family="ui-monospace, 'SF Mono', Menlo, Consolas, monospace" font-size="24" font-weight="800">SD</text>
    <text x="76" y="24" fill="#fff" font-family="ui-monospace, 'SF Mono', Menlo, Consolas, monospace" font-size="20" font-weight="700">/signupdoggy</text>
    <text x="76" y="48" fill="rgba(255,255,255,0.6)" font-family="ui-monospace, 'SF Mono', Menlo, Consolas, monospace" font-size="14">v2.1.0</text>
  </g>

  <!-- Badge (top-right) -->
  <g transform="translate(1140, 80)">
    <rect x="-200" y="-30" width="200" height="40" fill="rgba(62, 207, 142, 0.1)" stroke="#3ecf8e" stroke-width="1" rx="2"/>
    <text x="-100" y="-4" text-anchor="middle" fill="#3ecf8e" font-family="ui-monospace, 'SF Mono', Menlo, Consolas, monospace" font-size="14" font-weight="700">${escapeXml(badge.toUpperCase())}</text>
  </g>

  <!-- Title (word-wrapped, multi-line) -->
  <g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" font-weight="800" fill="#fff">
${titleLines
    .map(
      (line, i) =>
        `    <text x="60" y="${titleYStart + i * titleLineHeight}" font-size="62" letter-spacing="-1.5">${escapeXml(line)}</text>`
    )
    .join('\n')}
  </g>

  <!-- Subtitle (mono, dim) -->
${
    subtitle
      ? `  <text x="60" y="${subtitleY}" font-family="ui-monospace, 'SF Mono', Menlo, Consolas, monospace" font-size="22" fill="rgba(255,255,255,0.7)">${escapeXml(subtitle)}</text>`
      : ''
  }

  <!-- Footer divider -->
  <line x1="60" y1="560" x2="1140" y2="560" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>

  <!-- Path breadcrumb (bottom-left) -->
  <text x="60" y="595" font-family="ui-monospace, 'SF Mono', Menlo, Consolas, monospace" font-size="18" fill="rgba(255,255,255,0.5)">signupdoggy.pages.dev<tspan fill="#3ecf8e" font-weight="700">${escapeXml(path)}</tspan></text>

  <!-- CTA pill (bottom-right) -->
  <g transform="translate(1140, 590)">
    <rect x="-200" y="-22" width="200" height="36" fill="#3ecf8e" rx="18"/>
    <text x="-100" y="2" text-anchor="middle" fill="#000" font-family="ui-monospace, 'SF Mono', Menlo, Consolas, monospace" font-size="14" font-weight="700">▶ GET FREE API KEY</text>
  </g>

  <!-- Subtle scanline for the retro vibe -->
  <line x1="0" y1="316" x2="1200" y2="316" stroke="rgba(62, 207, 142, 0.1)" stroke-width="1" stroke-dasharray="2 6"/>
</svg>`;
}

// GET /api/og?title=...&subtitle=...&path=...&badge=...
export const onRequestGet: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const params: OGParams = {
    title: url.searchParams.get('title') ?? DEFAULTS.title,
    subtitle: url.searchParams.get('subtitle') ?? '',
    path: url.searchParams.get('path') ?? DEFAULTS.path,
    badge: url.searchParams.get('badge') ?? DEFAULTS.badge,
  };

  const svg = renderSVG(params);

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      // Edge-cached for a day (immutable), browser-cached for an hour.
      // Adjust the URL (change the title text) to bust the cache.
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, immutable',
      // Permissive CORS — useful when the SVG is embedded in another
      // site's share-card preview tool.
      'Access-Control-Allow-Origin': '*',
      // Hint to CDNs / OG crawlers that this is a static asset
      // despite being a function.
      'X-Content-Type-Options': 'nosniff',
    },
  });
};

// HEAD support — many crawlers (and some link-preview services)
// issue HEAD before GET. We rebuild the SVG just to get the right
// Content-Length, but skip the body bytes.
export const onRequestHead: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const params: OGParams = {
    title: url.searchParams.get('title') ?? DEFAULTS.title,
    subtitle: url.searchParams.get('subtitle') ?? '',
    path: url.searchParams.get('path') ?? DEFAULTS.path,
    badge: url.searchParams.get('badge') ?? DEFAULTS.badge,
  };
  const svg = renderSVG(params);
  return new Response(null, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Content-Length': String(new TextEncoder().encode(svg).byteLength),
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, immutable',
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
    },
  });
};