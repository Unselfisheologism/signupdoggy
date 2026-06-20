// Cloudflare Pages Function — /api/featured/[slug]
//
// On-the-fly featured-image generator for blog posts. Returns a
// 1200x630 SVG with the post title, tags, and reading time. The
// blog post pages reference this URL in their og:image + primaryImageOfPage
// schema tags so Google Images can attribute every post.
//
// Same SVG-only design as /api/og (no canvas, no npm deps).
//
// Routes:
//   /api/featured/<slug>.svg
//   /api/featured/<slug>.svg?variant=og         (square-ish OG variant)
//
// The slug must be a valid blog post slug — we look up the post metadata
// from app/src/lib/posts.ts at build time and bake the titles into a
// static lookup table here so we don't need a runtime import.

interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingTime: string;
  tags: string[];
}

// Mirror of app/src/lib/posts.ts — baked at write-time so the Cloudflare
// Pages Function has zero runtime imports. Keep in sync when you add
// or remove posts (the prerender build will surface any drift because
// posts.ts is the source of truth).
const POSTS: Record<string, PostMeta> = {
  'best-free-disposable-email-checker-api-2026': {
    slug: 'best-free-disposable-email-checker-api-2026',
    title: 'The best free disposable email checker API for 2026',
    description: 'A side-by-side comparison of the disposable email checker APIs that actually have a usable free tier in 2026.',
    date: '2026-06-19',
    readingTime: '8 min',
    tags: ['Disposable email', 'API', 'Indie hackers'],
  },
  'how-to-block-vpn-and-tor-signups-without-blocking-real-users': {
    slug: 'how-to-block-vpn-and-tor-signups-without-blocking-real-users',
    title: 'How to block VPN and Tor signups without blocking real users',
    description: 'The signal-stacking playbook for catching bots without throwing away buyers.',
    date: '2026-06-19',
    readingTime: '11 min',
    tags: ['VPN detection', 'Tor', 'Fraud prevention'],
  },
  'ipqualityscore-vs-signupdoggy-honest-comparison': {
    slug: 'ipqualityscore-vs-signupdoggy-honest-comparison',
    title: 'IPQualityScore vs SignupDoggy: an honest, no-affiliate-links comparison',
    description: 'Side-by-side feature, price, latency, and catch-rate comparison.',
    date: '2026-06-19',
    readingTime: '9 min',
    tags: ['IPQualityScore', 'Comparison', 'Fraud API'],
  },
  'cloudflare-turnstile-vs-server-side-fraud-api': {
    slug: 'cloudflare-turnstile-vs-server-side-fraud-api',
    title: 'Cloudflare Turnstile vs a server-side fraud API',
    description: 'The 2-stage funnel pattern that catches bots without losing real users.',
    date: '2026-06-19',
    readingTime: '7 min',
    tags: ['Turnstile', 'CAPTCHA', 'Bot detection'],
  },
  'how-to-validate-your-saas-idea-with-real-users': {
    slug: 'how-to-validate-your-saas-idea-with-real-users',
    title: 'How SaaS founders should actually get user validation',
    description: 'A 5-step playbook for validating with buyers, not free users.',
    date: '2026-06-19',
    readingTime: '9 min',
    tags: ['SaaS', 'Validation', 'Indie hackers'],
  },
  'disposable-email-detection-nodejs-tutorial': {
    slug: 'disposable-email-detection-nodejs-tutorial',
    title: 'Disposable email detection in Node.js: a 2026 tutorial',
    description: 'A copy-paste Node.js tutorial for detecting disposable, temporary, and throwaway email addresses.',
    date: '2026-06-20',
    readingTime: '10 min',
    tags: ['Disposable email', 'Node.js', 'Tutorial'],
  },
  'maxmind-minfraud-vs-signupdoggy': {
    slug: 'maxmind-minfraud-vs-signupdoggy',
    title: 'MaxMind minFraud vs SignupDoggy: which one do you actually need?',
    description: 'MaxMind is the legacy enterprise choice. SignupDoggy is the indie-hacker alternative.',
    date: '2026-06-20',
    readingTime: '8 min',
    tags: ['MaxMind', 'Comparison', 'Fraud API'],
  },
  'sift-vs-signupdoggy-fraud-api-comparison': {
    slug: 'sift-vs-signupdoggy-fraud-api-comparison',
    title: 'Sift vs SignupDoggy: the 2026 fraud API comparison for small teams',
    description: 'Sift is the 800-pound gorilla. SignupDoggy is a solo-founder project.',
    date: '2026-06-20',
    readingTime: '9 min',
    tags: ['Sift', 'Comparison', 'Fraud API'],
  },
  'how-to-stop-bot-signups-without-captcha': {
    slug: 'how-to-stop-bot-signups-without-captcha',
    title: 'How to stop bot signups without annoying real users',
    description: 'CAPTCHAs block bots and lose you 8-15% of real users. Server-side fraud APIs block bots with zero user friction.',
    date: '2026-06-20',
    readingTime: '11 min',
    tags: ['Bot detection', 'CAPTCHA', 'Signup fraud'],
  },
  'email-validation-vs-email-verification': {
    slug: 'email-validation-vs-email-verification',
    title: 'Email validation vs email verification: what is the difference?',
    description: 'These two terms get used interchangeably and they should not.',
    date: '2026-06-20',
    readingTime: '6 min',
    tags: ['Email validation', 'Email verification', 'Disposable email'],
  },
  'how-to-detect-vpn-users-nodejs': {
    slug: 'how-to-detect-vpn-users-nodejs',
    title: 'How to detect VPN users at signup (Node.js + fraud API)',
    description: 'A working code snippet for detecting VPN, Tor, and proxy users in your Node.js signup handler.',
    date: '2026-06-20',
    readingTime: '8 min',
    tags: ['VPN detection', 'Node.js', 'Tutorial'],
  },
  'best-fraud-detection-apis-indie-hackers-2026': {
    slug: 'best-fraud-detection-apis-indie-hackers-2026',
    title: 'The 7 best fraud detection APIs for indie hackers',
    description: 'A ranked, side-by-side comparison of every fraud detection API with a free tier.',
    date: '2026-06-20',
    readingTime: '12 min',
    tags: ['Comparison', 'Fraud API', 'Indie hackers'],
  },
  'signup-form-anti-pattern-saas-30-percent-users': {
    slug: 'signup-form-anti-pattern-saas-30-percent-users',
    title: 'The signup form anti-pattern that costs SaaS 30% of real users',
    description: 'Most SaaS signup forms are optimized for bot defense at the cost of real-user conversion.',
    date: '2026-06-20',
    readingTime: '7 min',
    tags: ['SaaS', 'Conversion', 'UX'],
  },
  'signup-validation-supabase-auth-integration': {
    slug: 'signup-validation-supabase-auth-integration',
    title: 'How to validate signups with Supabase Auth (with code)',
    description: 'A working Supabase Edge Function that scores a signup before allowing the user to be created.',
    date: '2026-06-20',
    readingTime: '8 min',
    tags: ['Supabase', 'Tutorial', 'Integration'],
  },
  'disposable-email-list-2026-how-to-maintain': {
    slug: 'disposable-email-list-2026-how-to-maintain',
    title: 'The disposable email domain list 2026: how to maintain your own',
    description: 'Every public disposable email list is stale within 48 hours. Here is the exact process to maintain your own blocklist.',
    date: '2026-06-20',
    readingTime: '9 min',
    tags: ['Disposable email', 'Tutorial', 'Engineering'],
  },
};

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function sanitize(s: string, maxLen: number): string {
  return s.replace(/<[^>]*>/g, '').slice(0, maxLen);
}

function wrapTitle(title: string, maxCharsPerLine = 30): string[] {
  const words = title.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxCharsPerLine && current) {
      lines.push(current.trim());
      current = word;
    } else {
      current = (current + ' ' + word).trim();
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 4);
}

function renderFeaturedSVG(post: PostMeta, variant: 'square' | 'og' = 'og'): string {
  const title = sanitize(post.title, 100);
  const description = sanitize(post.description, 200);
  const tags = post.tags.slice(0, 3);
  const titleLines = wrapTitle(title);
  const titleYStart = 250;
  const titleLineHeight = 76;

  // Pick an accent color based on the first tag — gives each topic area
  // its own visual signature on the social card without per-post images.
  const TAG_COLORS: Record<string, string> = {
    'Disposable email': '#3ecf8e',
    'API': '#62a5ff',
    'Tutorial': '#ffa15c',
    'Engineering': '#c084fc',
    'VPN detection': '#ff6b6b',
    'Tor': '#ff6b6b',
    'Fraud prevention': '#fbbf24',
    'Comparison': '#62a5ff',
    'Bot detection': '#ff6b6b',
    'CAPTCHA': '#62a5ff',
    'Signup fraud': '#ff6b6b',
    'SaaS': '#fbbf24',
    'Validation': '#fbbf24',
    'Indie hackers': '#fbbf24',
    'UX': '#c084fc',
    'Supabase': '#3ecf8e',
    'Integration': '#3ecf8e',
    'Auth': '#3ecf8e',
    'Node.js': '#3ecf8e',
    'Email validation': '#62a5ff',
    'Email verification': '#62a5ff',
    'IPQualityScore': '#62a5ff',
    'MaxMind': '#62a5ff',
    'Sift': '#c084fc',
    'Signup form': '#fbbf24',
    'Conversion': '#fbbf24',
    'Pricing': '#fbbf24',
  };
  const accent = tags.map((t) => TAG_COLORS[t] || '#3ecf8e').find(Boolean) || '#3ecf8e';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0a0a"/>
      <stop offset="100%" stop-color="#${variant === 'og' ? '111827' : '0a0a0a'}"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>

  <!-- Top accent bar in tag-specific color -->
  <rect x="0" y="0" width="1200" height="6" fill="${accent}"/>

  <!-- Logo block top-left -->
  <g transform="translate(60, 60)">
    <rect x="0" y="0" width="56" height="56" fill="${accent}" rx="4"/>
    <text x="28" y="38" text-anchor="middle" fill="#000" font-family="ui-monospace, monospace" font-size="24" font-weight="800">SD</text>
    <text x="76" y="24" fill="#fff" font-family="ui-monospace, monospace" font-size="20" font-weight="700">/signupdoggy</text>
    <text x="76" y="48" fill="rgba(255,255,255,0.6)" font-family="ui-monospace, monospace" font-size="14">blog</text>
  </g>

  <!-- Date + reading time badge top-right -->
  <g transform="translate(1140, 80)">
    <rect x="-260" y="-30" width="260" height="40" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" stroke-width="1" rx="2"/>
    <text x="-130" y="-4" text-anchor="middle" fill="rgba(255,255,255,0.85)" font-family="ui-monospace, monospace" font-size="14" font-weight="600">
      ${escapeXml(post.date)} · ${escapeXml(post.readingTime)}
    </text>
  </g>

  <!-- Tag chips above the title -->
  <g transform="translate(60, 175)">
    ${tags.map((tag, i) => `
      <g transform="translate(${i * 200}, 0)">
        <rect x="0" y="0" width="${tag.length * 9 + 30}" height="32" fill="rgba(255,255,255,0.05)" stroke="${accent}" stroke-width="1.5" rx="16"/>
        <text x="${(tag.length * 9 + 30) / 2}" y="22" text-anchor="middle" fill="${accent}" font-family="ui-monospace, monospace" font-size="13" font-weight="700">${escapeXml(tag.toUpperCase())}</text>
      </g>
    `).join('')}
  </g>

  <!-- Title (multi-line) -->
  <g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" font-weight="800" fill="#fff">
    ${titleLines.map((line, i) => `
    <text x="60" y="${titleYStart + i * titleLineHeight}" font-size="58" letter-spacing="-1.5">${escapeXml(line)}</text>`).join('')}
  </g>

  <!-- Description (one line, truncated) -->
  <text x="60" y="${titleYStart + titleLines.length * titleLineHeight + 36}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" font-size="20" fill="rgba(255,255,255,0.7)">
    ${escapeXml(description.slice(0, 110))}${description.length > 110 ? '...' : ''}
  </text>

  <!-- Bottom footer -->
  <line x1="60" y1="560" x2="1140" y2="560" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>

  <!-- Path breadcrumb -->
  <text x="60" y="595" font-family="ui-monospace, monospace" font-size="18" fill="rgba(255,255,255,0.5)">
    signupdoggy.pages.dev<tspan fill="${accent}" font-weight="700">/blog/${escapeXml(post.slug)}</tspan>
  </text>

  <!-- "READ POST" CTA pill bottom-right -->
  <g transform="translate(1140, 590)">
    <rect x="-160" y="-25" width="160" height="36" fill="${accent}" rx="18"/>
    <text x="-80" y="-1" text-anchor="middle" fill="#000" font-family="ui-monospace, monospace" font-size="14" font-weight="700">▶ READ POST</text>
  </g>
</svg>`;
}

export const onRequestGet: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  // Path: /api/featured/<slug>.svg or /api/featured/<slug>
  // The Pages Function filename lives at api/featured/[slug], so
  // `context.params.slug` would normally carry the segment. But we
  // can't rely on PagesFunction routing for nested dynamic paths in
  // the Pages Functions runtime — we parse it from the URL instead.
  const pathParts = url.pathname.split('/').filter(Boolean);
  // Expected: ['api', 'featured', '<slug>']
  let slug = pathParts[2] || '';
  // Strip .svg suffix if present
  if (slug.endsWith('.svg')) slug = slug.slice(0, -4);

  const post = POSTS[slug];
  if (!post) {
    return new Response(
      `<!-- unknown slug "${slug}" — known: ${Object.keys(POSTS).slice(0, 3).join(', ')}, ... -->`,
      { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  }

  const variant = url.searchParams.get('variant') === 'square' ? 'square' : 'og';
  const svg = renderFeaturedSVG(post, variant);

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      // Cache for 1 day at the edge, 1 hour at the browser — these are
      // generated on first hit and then served from CF's edge cache.
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, immutable',
      'Access-Control-Allow-Origin': '*',
    },
  });
};