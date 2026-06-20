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
  /** Slugs of related posts (rendered at the bottom of the post). */
  relatedSlugs?: string[];
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
  relatedSlugs: ['disposable-email-detection-nodejs-tutorial', 'disposable-email-list-2026-how-to-maintain', 'email-validation-vs-email-verification', 'how-to-detect-vpn-users-nodejs'],
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
  relatedSlugs: ['how-to-detect-vpn-users-nodejs', 'how-to-stop-bot-signups-without-captcha', 'best-fraud-detection-apis-indie-hackers-2026', 'cloudflare-turnstile-vs-server-side-fraud-api'],
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
  relatedSlugs: ['maxmind-minfraud-vs-signupdoggy', 'sift-vs-signupdoggy-fraud-api-comparison', 'best-fraud-detection-apis-indie-hackers-2026', 'vs/ipqualityscore'],
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
  relatedSlugs: ['how-to-stop-bot-signups-without-captcha', 'best-fraud-detection-apis-indie-hackers-2026', 'signup-form-anti-pattern-saas-30-percent-users', 'integrations'],
  },  {
    slug: 'disposable-email-detection-nodejs-tutorial',
    title: 'Disposable email detection in Node.js: a 2026 tutorial with code',
    description: 'A copy-paste Node.js tutorial for detecting disposable, temporary, and throwaway email addresses at signup. Covers 4 approaches: local blocklist, DNS-based, third-party API, and SignupDoggy. Includes a working 30-line Express middleware you can drop into any SaaS.',
    date: '2026-06-20',
    readingTime: '10 min',
    tags: ['Disposable email', 'Node.js', 'Tutorial', 'API'],
  relatedSlugs: ['signup-form-anti-pattern-saas-30-percent-users', 'use-cases/indie-hackers', 'best-fraud-detection-apis-indie-hackers-2026', 'use-cases/saas-startups'],
  },
  {
    slug: 'maxmind-minfraud-vs-signupdoggy',
    title: 'MaxMind minFraud vs SignupDoggy: which one do you actually need?',
    description: 'A side-by-side comparison of MaxMind minFraud and SignupDoggy for SaaS signup fraud detection. Price per call, accuracy on bot/disposable-email traffic, integration time, minimum spend, and which to pick for indie hackers vs enterprise.',
    date: '2026-06-20',
    readingTime: '8 min',
    tags: ['MaxMind', 'Comparison', 'Fraud API', 'Pricing'],
  relatedSlugs: ['best-free-disposable-email-checker-api-2026', 'disposable-email-list-2026-how-to-maintain', 'signup-validation-supabase-auth-integration', 'email-validation-vs-email-verification'],
  },
  {
    slug: 'sift-vs-signupdoggy-fraud-api-comparison',
    title: 'Sift vs SignupDoggy: the 2026 fraud API comparison for small teams',
    description: 'Sift is the 800-pound gorilla of fraud detection. SignupDoggy is a solo-founder project. Here is an honest comparison of features, price, and which one fits a 2-person SaaS team that just needs to filter 5,000 signups a month.',
    date: '2026-06-20',
    readingTime: '9 min',
    tags: ['Sift', 'Comparison', 'Fraud API', 'Indie hackers'],
  relatedSlugs: ['ipqualityscore-vs-signupdoggy-honest-comparison', 'sift-vs-signupdoggy-fraud-api-comparison', 'best-fraud-detection-apis-indie-hackers-2026', 'vs/maxmind'],
  },
  {
    slug: 'how-to-stop-bot-signups-without-captcha',
    title: 'How to stop bot signups without annoying real users (2026 playbook)',
    description: 'CAPTCHAs block bots and lose you 8-15% of real users. Server-side fraud APIs block bots with zero user friction. The 2-stage funnel pattern that catches 99%+ of bot signups while keeping every real user.',
    date: '2026-06-20',
    readingTime: '11 min',
    tags: ['Bot detection', 'CAPTCHA', 'Signup fraud', 'Indie hackers'],
  relatedSlugs: ['ipqualityscore-vs-signupdoggy-honest-comparison', 'maxmind-minfraud-vs-signupdoggy', 'best-fraud-detection-apis-indie-hackers-2026', 'vs/sift'],
  },
  {
    slug: 'email-validation-vs-email-verification',
    title: 'Email validation vs email verification: what is the difference?',
    description: 'These two terms get used interchangeably and they should not. Email validation checks the format. Email verification checks the mailbox. Here is when to use which, and why signup fraud detection is a third, separate problem.',
    date: '2026-06-20',
    readingTime: '6 min',
    tags: ['Email validation', 'Email verification', 'Disposable email'],
  relatedSlugs: ['cloudflare-turnstile-vs-server-side-fraud-api', 'best-fraud-detection-apis-indie-hackers-2026', 'signup-form-anti-pattern-saas-30-percent-users', 'how-to-block-vpn-and-tor-signups-without-blocking-real-users'],
  },
  {
    slug: 'how-to-detect-vpn-users-nodejs',
    title: 'How to detect VPN users at signup (Node.js + fraud API, 2026)',
    description: 'A working code snippet for detecting VPN, Tor, and proxy users in your Node.js signup handler. Covers 3 approaches: IP range database, third-party API, and the right way to handle false positives (because 15% of your real users are on VPNs).',
    date: '2026-06-20',
    readingTime: '8 min',
    tags: ['VPN detection', 'Node.js', 'Tutorial', 'Fraud API'],
  relatedSlugs: ['disposable-email-detection-nodejs-tutorial', 'best-free-disposable-email-checker-api-2026', 'signup-validation-supabase-auth-integration', 'disposable-email-list-2026-how-to-maintain'],
  },
  {
    slug: 'best-fraud-detection-apis-indie-hackers-2026',
    title: 'The 7 best fraud detection APIs for indie hackers (2026 edition)',
    description: 'A ranked, side-by-side comparison of every fraud detection API with a free tier or under-$50/month plan. Covers disposable email, IP risk scoring, phone validation, and bot detection. Includes the one indie-hacker-specific gotcha nobody talks about.',
    date: '2026-06-20',
    readingTime: '12 min',
    tags: ['Comparison', 'Fraud API', 'Indie hackers', 'Pricing'],
  relatedSlugs: ['how-to-block-vpn-and-tor-signups-without-blocking-real-users', 'best-fraud-detection-apis-indie-hackers-2026', 'cloudflare-turnstile-vs-server-side-fraud-api', 'signup-validation-supabase-auth-integration'],
  },
  {
    slug: 'signup-form-anti-pattern-saas-30-percent-users',
    title: 'The signup form anti-pattern that costs SaaS 30% of real users',
    description: 'Most SaaS signup forms are optimized for bot defense at the cost of real-user conversion. The double-opt-in tax, the email-confirmation dead-end, and the captcha that fires when it should not. Plus the 7-line fix for each.',
    date: '2026-06-20',
    readingTime: '7 min',
    tags: ['SaaS', 'Conversion', 'UX', 'Signup form'],
  relatedSlugs: ['ipqualityscore-vs-signupdoggy-honest-comparison', 'maxmind-minfraud-vs-signupdoggy', 'sift-vs-signupdoggy-fraud-api-comparison', 'use-cases/indie-hackers'],
  },
  {
    slug: 'signup-validation-supabase-auth-integration',
    title: 'How to validate signups with Supabase Auth (with code, 2026)',
    description: 'A working Supabase Edge Function that scores a signup before allowing the user to be created. Wires SignupDoggy into the Supabase Auth sign-up trigger, so disposable emails, VPN users, and bots never reach your profiles table.',
    date: '2026-06-20',
    readingTime: '8 min',
    tags: ['Supabase', 'Tutorial', 'Integration', 'Auth'],
  relatedSlugs: ['how-to-stop-bot-signups-without-captcha', 'how-to-validate-your-saas-idea-with-real-users', 'cloudflare-turnstile-vs-server-side-fraud-api', 'best-fraud-detection-apis-indie-hackers-2026'],
  },
  {
    slug: 'disposable-email-list-2026-how-to-maintain',
    title: 'The disposable email domain list 2026: how to maintain your own',
    description: 'Every public disposable email list is stale within 48 hours. Here is the exact process to maintain your own blocklist: the 5 GitHub repos to monitor, the per-provider crawls that catch the long tail, and how to deduplicate without losing entries.',
    date: '2026-06-20',
    readingTime: '9 min',
    tags: ['Disposable email', 'Tutorial', 'Engineering'],
    relatedSlugs: ['best-free-disposable-email-checker-api-2026', 'disposable-email-detection-nodejs-tutorial', 'email-validation-vs-email-verification', 'best-fraud-detection-apis-indie-hackers-2026'],
  },

];

export function getPostBySlug(slug: string): PostMeta | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getLatestPost(): PostMeta | undefined {
  return posts[0]; // posts are ordered newest-first; flip if you reorder
}
