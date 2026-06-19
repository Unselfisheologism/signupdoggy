// Blog post registry.
//
// Single source of truth for the list of posts rendered in:
//   - app/src/pages/Blog.tsx (React index page)
//   - app/scripts/prerender.mjs (the static prerender step that
//     writes one dist/<route>/index.html per public route — blog
//     posts included so crawlers see the body before JS runs)
//   - app/public/sitemap.xml (sourced from here when we re-generate
//     the sitemap at build time)
//
// The actual post BODY is in src/lib/postContent.ts — a single
// keyed-by-slug string map. We import the body into the React
// post page and the prerender script both consume the same source.
//
// To add a new post:
//   1. Add the markdown body string to POST_BODIES in postContent.ts.
//   2. Add a matching entry below (slug, title, etc.).
//   3. (Optional) Bump sitemap.xml manually or add a generate step.
//   4. Push — Cloudflare Pages builds and prerenders the new
//      dist/blog/<slug>/index.html automatically.

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  /** ISO date string (YYYY-MM-DD). */
  date: string;
  /** Pre-computed reading time for display (e.g. "9 min"). */
  readingTime: string;
  /** Visible tag chips on the card. */
  tags: string[];
  /** True for the most recent post — gets a "Latest" badge. */
  featured?: boolean;
}

export const posts: PostMeta[] = [
  {
    slug: 'best-free-disposable-email-checker-api-2026',
    title:
      'The best free disposable email checker API for 2026 (and why you actually need one)',
    description:
      'A side-by-side comparison of the disposable email checker APIs that actually have a usable free tier in 2026. Plus a 10-line code snippet to plug into any signup form.',
    date: '2026-06-19',
    readingTime: '8 min',
    tags: ['Disposable email', 'API', 'Indie hackers'],
    featured: true,
  },
  {
    slug: 'how-to-block-vpn-and-tor-signups-without-blocking-real-users',
    title:
      'How to block VPN and Tor signups without blocking real users (the 2026 playbook)',
    description:
      'Blocking all VPN traffic at signup sounds easy. It also locks out 15% of real users (remote workers, journalists, travelers). Here is the threshold-and-signal approach that catches bots without throwing away buyers.',
    date: '2026-06-19',
    readingTime: '11 min',
    tags: ['VPN detection', 'Tor', 'Fraud prevention'],
  },
  {
    slug: 'ipqualityscore-vs-signupdoggy-honest-comparison',
    title:
      'IPQualityScore vs SignupDoggy: an honest, no-affiliate-links comparison',
    description:
      'Both score signups. One is the 800-pound gorilla at $25–$400/month. The other is a solo-founder project at $0.01/call. Here is a feature-by-feature breakdown of what you actually get.',
    date: '2026-06-19',
    readingTime: '9 min',
    tags: ['IPQualityScore', 'Comparison', 'Fraud API'],
  },
  {
    slug: 'cloudflare-turnstile-vs-server-side-fraud-api',
    title:
      'Cloudflare Turnstile vs a server-side fraud API: which actually catches bots?',
    description:
      'Turnstile is free and frictionless. It also lets through every non-browser bot. A server-side fraud API costs a cent per call and catches the things Turnstile can\u2019t. Here is when to use which (or both).',
    date: '2026-06-19',
    readingTime: '7 min',
    tags: ['Turnstile', 'CAPTCHA', 'Bot detection'],
  },
  {
    slug: 'how-to-validate-your-saas-idea-with-real-users',
    title:
      'How SaaS founders should actually get user validation (and why most advice is wrong)',
    description:
      'Most "validate your SaaS idea" advice tells you to get more signups. That\u2019s the worst thing you can do. A 5-step playbook for validating with buyers, not free users.',
    date: '2026-06-19',
    readingTime: '9 min',
    tags: ['SaaS', 'Validation', 'Indie hackers'],
  },
];

export function getPostBySlug(slug: string): PostMeta | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getLatestPost(): PostMeta | undefined {
  return posts[0]; // posts are ordered newest-first; flip if you reorder
}
