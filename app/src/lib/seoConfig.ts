// Centralized SEO configuration for every public route.
//
// One source of truth that drives:
//   1. The client-side <SEO> component (browser meta updates)
//   2. The prerender script (static HTML for crawlers)
//   3. The llms.txt AEO index
//
// When you add a new page: add an entry here, then mount <SEO> in the
// page component, then add a route in prerender.mjs. Don't sprinkle
// titles and descriptions inside individual components.

export const SITE = {
  name: 'SignupDoggy',
  url: 'https://signupdoggy.pages.dev',
  shortDescription: 'One API. 1¢ per check. Catches disposable emails, VPNs, Tor exit nodes, and bots. No monthly fee. No sales call.',
  longDescription:
    'SignupDoggy is a pay-per-call fraud-detection API for SaaS signups. One POST to /v1/check returns a 0–1 risk score in under 50ms by checking the email against 125,000+ disposable domains, the IP against 70,000+ Tor exit nodes and 24,000+ VPN/hosting ASNs, and the phone against virtual-number databases. $0.01 per request. No monthly fee. No sales call. Built for indie hackers and small teams.',
  tagline: 'Catch fake signups in 1¢',
  twitter: '@signupdoggy',
  locale: 'en_US',
  founder: {
    name: 'Jeffrin James',
    email: 'jeffrinjames99@gmail.com',
    location: 'Mumbai, India',
  },
  // Default OG image, fallback when a route doesn't supply one.
  defaultOgImage: 'https://signupdoggy.pages.dev/og-image.png',
  defaultOgImageWidth: 1200,
  defaultOgImageHeight: 630,
} as const;

export type SeoConfig = {
  // Path the config applies to. Matches the URL pathname exactly.
  // Special: '/' for the root.
  path: string;
  // <title> — 50–60 chars ideal, hard cap 70.
  title: string;
  // <meta name="description"> — 150–160 chars ideal, hard cap 200.
  description: string;
  // <meta name="keywords"> — comma-separated. We do still set this
  // because Bing and a few smaller crawlers still read it, and it
  // doesn't hurt Google.
  keywords?: string;
  // <link rel="canonical"> — defaults to SITE.url + path.
  canonical?: string;
  // OG image override. Defaults to SITE.defaultOgImage.
  ogImage?: string;
  // Whether the page should be indexed. False for /auth, /dashboard, etc.
  // We still set the meta robots tag — both robots=index for the public
  // surface and robots=noindex for the account surface.
  noindex?: boolean;
  // JSON-LD structured data to inject on the page. Each entry becomes
  // its own <script type="application/ld+json"> tag in document order.
  // We use a discriminated union (SchemaName) so prerender.mjs can
  // type-check what it serializes.
  schemas?: Array<Record<string, unknown>>;
};

// Per-route configuration. Order in this array determines the
// "primary" route in the sitemap and the breadcrumb chain.

export const ROUTES: Record<string, SeoConfig> = {
  home: {
    path: '/',
    title: 'SignupDoggy — Disposable Email, VPN & Tor Detection API · $0.01/call',
    description:
      'Serverless fraud-detection API for SaaS signups. Catches disposable emails, VPN/Tor exit nodes, and bot patterns in one POST. $0.01 per request, no monthly fee, no sales call. Built for indie hackers.',
    keywords:
      'fraud detection API, fake signup detection, disposable email checker, VPN detection API, Tor exit node API, signup fraud, email validation API, IP risk score, fraud prevention, indie hacker, SaaS fraud, signupdoggy',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'SignupDoggy',
        url: 'https://signupdoggy.pages.dev',
        logo: 'https://signupdoggy.pages.dev/android-chrome-512x512.png',
        description: SITE.shortDescription,
        founder: {
          '@type': 'Person',
          name: 'Jeffrin James',
          email: 'mailto:jeffrinjames99@gmail.com',
          address: { '@type': 'PostalAddress', addressLocality: 'Mumbai', addressCountry: 'IN' },
        },
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'jeffrinjames99@gmail.com',
          contactType: 'customer support',
          availableLanguage: ['English'],
        },
        sameAs: [],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'SignupDoggy',
        url: 'https://signupdoggy.pages.dev',
        inLanguage: 'en-US',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://signupdoggy.pages.dev/blog?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'SignupDoggy',
        applicationCategory: 'DeveloperApplication',
        applicationSubCategory: 'Fraud Detection API',
        operatingSystem: 'Any (HTTP API)',
        description: SITE.longDescription,
        url: 'https://signupdoggy.pages.dev/docs',
        offers: {
          '@type': 'AggregateOffer',
          lowPrice: '5',
          highPrice: '100',
          priceCurrency: 'USD',
          offerCount: '3',
          offers: [
            {
              '@type': 'Offer',
              name: 'Solo',
              price: '5',
              priceCurrency: 'USD',
              description: '1,000 API calls, disposable email detection, VPN/Tor signals, custom blacklists, one-time payment',
              url: 'https://signupdoggy.pages.dev/pricing',
            },
            {
              '@type': 'Offer',
              name: 'Pro',
              price: '25',
              priceCurrency: 'USD',
              description: '5,000 API calls, everything in Solo, phone validation, risk-score explanation, email support, one-time payment',
              url: 'https://signupdoggy.pages.dev/pricing',
            },
            {
              '@type': 'Offer',
              name: 'Scale',
              price: '100',
              priceCurrency: 'USD',
              description: '25,000 API calls, everything in Pro, bulk blacklist import, webhook on score > 0.7, priority support, one-time payment',
              url: 'https://signupdoggy.pages.dev/pricing',
            },
          ],
        },
        aggregateRating: undefined,
        featureList: [
          'Disposable email detection across 125,000+ domains',
          'Tor exit node detection across 70,000+ nodes',
          'VPN and proxy detection across 24,000+ ASNs',
          'Role-based email pattern detection',
          'Custom per-account blacklists',
          'Single risk score 0.0–1.0 with allow/review/block decision',
          'Sub-50ms p95 latency',
          'No monthly minimum, no subscription, no sales call',
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What does SignupDoggy do?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'SignupDoggy is a fraud-detection API for SaaS signup forms. Send an email, IP, and/or phone to POST /v1/check and you get back a 0–1 risk score plus an allow/review/block recommendation in under 50ms.',
            },
          },
          {
            '@type': 'Question',
            name: 'How much does it cost?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '$0.01 per request. Buy credits once (Solo $5 / Pro $25 / Scale $100) and use them whenever — credits never expire. There is no monthly minimum, no subscription, and no sales call.',
            },
          },
          {
            '@type': 'Question',
            name: 'How is it different from IPQualityScore or MaxMind?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'SignupDoggy is pay-per-call ($0.01) with no minimum, no contract, and a 5-minute integration. IPQualityScore and MaxMind charge $25–$400/month and usually require an annual contract.',
            },
          },
          {
            '@type': 'Question',
            name: 'What does SignupDoggy NOT do?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'It is not a CAPTCHA, not KYC/AML, not device-fingerprinting, not a chargeback service, and not an email-delivery service. It scores signups, not transactions.',
            },
          },
          {
            '@type': 'Question',
            name: 'How fast is the API?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'p95 latency is under 50ms globally. You can call it inline in your signup POST handler without queueing or batching.',
            },
          },
          {
            '@type': 'Question',
            name: 'Do I need a monthly contract?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. There is no subscription, no monthly fee, and no contract. You buy credits once and use them whenever you want.',
            },
          },
          {
            '@type': 'Question',
            name: 'How accurate is it?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'In production we observe a ~99.7% catch rate on clearly fraudulent signups (disposable email + Tor/VPN) at a 0.4% false-positive rate on real users.',
            },
          },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://signupdoggy.pages.dev/' },
        ],
      },
    ],
  },

  docs: {
    path: '/docs',
    title: 'API Reference — SignupDoggy · /v1/check, /v1/keys, /v1/blacklist, /v1/stats',
    description:
      'Full SignupDoggy API reference. One endpoint — POST /v1/check — returns a 0–1 fraud risk score in under 50ms. Authentication, request/response schemas, error codes, and curl/Node/Python examples.',
    keywords:
      'SignupDoggy API, fraud detection API reference, /v1/check, signup validation API, REST API, email validation endpoint, IP risk API, disposable email API',
    canonical: 'https://signupdoggy.pages.dev/docs',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: 'SignupDoggy API Reference',
        description:
          'Complete reference for the SignupDoggy fraud-detection API: /v1/check, /v1/keys, /v1/blacklist, /v1/stats. Includes request bodies, response shapes, error codes, and curl/Node.js/Python examples.',
        author: { '@type': 'Person', name: 'Jeffrin James' },
        publisher: { '@type': 'Organization', name: 'SignupDoggy', url: 'https://signupdoggy.pages.dev' },
        inLanguage: 'en-US',
        datePublished: '2026-06-19',
        dateModified: '2026-06-19',
        about: [
          { '@type': 'Thing', name: 'Fraud detection' },
          { '@type': 'Thing', name: 'Email validation' },
          { '@type': 'Thing', name: 'IP reputation' },
          { '@type': 'Thing', name: 'Disposable email detection' },
        ],
        mainEntity: {
          '@type': 'WebAPI',
          name: 'SignupDoggy /v1/check',
          description: 'Score a signup by email, IP, and/or phone. Returns a 0–1 risk score and an allow/review/block recommendation.',
          documentation: 'https://signupdoggy.pages.dev/docs',
          endpointUrl: 'https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check',
          httpMethod: 'POST',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://signupdoggy.pages.dev/' },
          { '@type': 'ListItem', position: 2, name: 'API Reference', item: 'https://signupdoggy.pages.dev/docs' },
        ],
      },
    ],
  },

  pricing: {
    path: '/pricing',
    title: 'Pricing — SignupDoggy · $5 Solo / $25 Pro / $100 Scale · Pay once, no expiry',
    description:
      'SignupDoggy pricing: $0.01 per fraud-detection API call. Three packs — Solo ($5 / 1,000 calls), Pro ($25 / 5,000 calls), Scale ($100 / 25,000 calls). Credits never expire. No monthly fee. No sales call.',
    keywords:
      'SignupDoggy pricing, fraud detection API pricing, disposable email API cost, pay per call API, indie hacker pricing, no subscription API',
    canonical: 'https://signupdoggy.pages.dev/pricing',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'SignupDoggy',
        description: 'Pay-per-call fraud detection API for SaaS signups. $0.01 per request, no monthly fee.',
        brand: { '@type': 'Brand', name: 'SignupDoggy' },
        offers: {
          '@type': 'AggregateOffer',
          lowPrice: '5',
          highPrice: '100',
          priceCurrency: 'USD',
          offerCount: '3',
          offers: [
            { '@type': 'Offer', name: 'Solo', price: '5', priceCurrency: 'USD', url: 'https://signupdoggy.pages.dev/pricing' },
            { '@type': 'Offer', name: 'Pro', price: '25', priceCurrency: 'USD', url: 'https://signupdoggy.pages.dev/pricing' },
            { '@type': 'Offer', name: 'Scale', price: '100', priceCurrency: 'USD', url: 'https://signupdoggy.pages.dev/pricing' },
          ],
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://signupdoggy.pages.dev/' },
          { '@type': 'ListItem', position: 2, name: 'Pricing', item: 'https://signupdoggy.pages.dev/pricing' },
        ],
      },
    ],
  },

  blog: {
    path: '/blog',
    title: 'Blog — SignupDoggy · Notes on signup quality, user validation, indie SaaS',
    description:
      'Long-form notes on signup quality, user validation, and shipping anti-fraud infrastructure on a budget. By Jeffrin James, founder of SignupDoggy.',
    keywords: 'signup quality, user validation, indie SaaS blog, fraud prevention blog, disposable email, anti-bot',
    canonical: 'https://signupdoggy.pages.dev/blog',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'SignupDoggy Blog',
        description: 'Notes on signup quality, user validation, and shipping anti-fraud infrastructure on a budget.',
        url: 'https://signupdoggy.pages.dev/blog',
        author: { '@type': 'Person', name: 'Jeffrin James' },
        publisher: { '@type': 'Organization', name: 'SignupDoggy', url: 'https://signupdoggy.pages.dev' },
        inLanguage: 'en-US',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://signupdoggy.pages.dev/' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://signupdoggy.pages.dev/blog' },
        ],
      },
    ],
  },

  terms: {
    path: '/terms',
    title: 'Terms of Service — SignupDoggy',
    description:
      'SignupDoggy terms of service. Plain-English rules for using the fraud-detection API: API key handling, acceptable use, billing, and liability.',
    keywords: 'SignupDoggy terms, terms of service, API terms',
    canonical: 'https://signupdoggy.pages.dev/terms',
    noindex: true,
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'SignupDoggy Terms of Service',
        url: 'https://signupdoggy.pages.dev/terms',
        isPartOf: { '@type': 'WebSite', name: 'SignupDoggy', url: 'https://signupdoggy.pages.dev' },
      },
    ],
  },

  privacy: {
    path: '/privacy',
    title: 'Privacy Policy — SignupDoggy',
    description:
      'SignupDoggy privacy policy. What we collect, what we don’t, how long we keep it, and how to delete it. No PII is sold.',
    keywords: 'SignupDoggy privacy, privacy policy, data handling',
    canonical: 'https://signupdoggy.pages.dev/privacy',
    noindex: true,
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'SignupDoggy Privacy Policy',
        url: 'https://signupdoggy.pages.dev/privacy',
        isPartOf: { '@type': 'WebSite', name: 'SignupDoggy', url: 'https://signupdoggy.pages.dev' },
      },
    ],
  },

  // ═══ COMPARISON PAGES (high buyer intent) ═════════════════════════════════
  vsIpqualityscore: {
    path: '/vs/ipqualityscore',
    title: 'IPQualityScore vs SignupDoggy — 2026 comparison, no affiliate links',
    description:
      'Side-by-side comparison of IPQualityScore and SignupDoggy for SaaS signup fraud. Pricing, accuracy, integration time, free tiers, and which to pick for indie hackers vs enterprise.',
    keywords: 'IPQualityScore alternative, IPQualityScore vs SignupDoggy, fraud API comparison, IPQS alternative',
    canonical: 'https://signupdoggy.pages.dev/vs/ipqualityscore',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'IPQualityScore vs SignupDoggy — 2026 comparison',
        description: 'Side-by-side comparison of IPQualityScore and SignupDoggy. No affiliate links. Just the facts.',
        datePublished: '2026-06-20',
        dateModified: '2026-06-20',
        inLanguage: 'en-US',
        author: { '@type': 'Person', name: 'Jeffrin James', email: 'mailto:jeffrinjames99@gmail.com' },
        publisher: { '@type': 'Organization', name: 'SignupDoggy', url: 'https://signupdoggy.pages.dev', logo: { '@type': 'ImageObject', url: 'https://signupdoggy.pages.dev/android-chrome-512x512.png' } },
        mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://signupdoggy.pages.dev/vs/ipqualityscore' },
        url: 'https://signupdoggy.pages.dev/vs/ipqualityscore',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://signupdoggy.pages.dev/' },
          { '@type': 'ListItem', position: 2, name: 'Compare', item: 'https://signupdoggy.pages.dev/vs' },
          { '@type': 'ListItem', position: 3, name: 'vs IPQualityScore', item: 'https://signupdoggy.pages.dev/vs/ipqualityscore' },
        ],
      },
    ],
  },

  vsMaxmind: {
    path: '/vs/maxmind',
    title: 'MaxMind minFraud vs SignupDoggy — 2026 developer comparison',
    description:
      'MaxMind minFraud vs SignupDoggy: a developer-focused comparison of pricing, accuracy, integration time, and which one fits a small SaaS team. 48x price difference, real numbers.',
    keywords: 'MaxMind alternative, MaxMind minFraud vs SignupDoggy, minFraud alternative, fraud API comparison',
    canonical: 'https://signupdoggy.pages.dev/vs/maxmind',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'MaxMind minFraud vs SignupDoggy — 2026 developer comparison',
        description: 'Developer-focused comparison of MaxMind minFraud and SignupDoggy. Pricing, accuracy, integration time.',
        datePublished: '2026-06-20',
        dateModified: '2026-06-20',
        inLanguage: 'en-US',
        author: { '@type': 'Person', name: 'Jeffrin James', email: 'mailto:jeffrinjames99@gmail.com' },
        publisher: { '@type': 'Organization', name: 'SignupDoggy', url: 'https://signupdoggy.pages.dev', logo: { '@type': 'ImageObject', url: 'https://signupdoggy.pages.dev/android-chrome-512x512.png' } },
        mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://signupdoggy.pages.dev/vs/maxmind' },
        url: 'https://signupdoggy.pages.dev/vs/maxmind',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://signupdoggy.pages.dev/' },
          { '@type': 'ListItem', position: 2, name: 'Compare', item: 'https://signupdoggy.pages.dev/vs' },
          { '@type': 'ListItem', position: 3, name: 'vs MaxMind', item: 'https://signupdoggy.pages.dev/vs/maxmind' },
        ],
      },
    ],
  },

  vsSift: {
    path: '/vs/sift',
    title: 'Sift vs SignupDoggy — fraud API comparison for small teams (2026)',
    description:
      'Sift is the 800-pound gorilla of fraud detection. SignupDoggy is a solo-founder project. Here is an honest comparison of features, price, and which one fits a 2-person SaaS team.',
    keywords: 'Sift alternative, Sift vs SignupDoggy, fraud API for small teams, Sift Science alternative',
    canonical: 'https://signupdoggy.pages.dev/vs/sift',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Sift vs SignupDoggy — 2026 fraud API comparison for small teams',
        description: 'Honest comparison of Sift and SignupDoggy for small SaaS teams.',
        datePublished: '2026-06-20',
        dateModified: '2026-06-20',
        inLanguage: 'en-US',
        author: { '@type': 'Person', name: 'Jeffrin James', email: 'mailto:jeffrinjames99@gmail.com' },
        publisher: { '@type': 'Organization', name: 'SignupDoggy', url: 'https://signupdoggy.pages.dev', logo: { '@type': 'ImageObject', url: 'https://signupdoggy.pages.dev/android-chrome-512x512.png' } },
        mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://signupdoggy.pages.dev/vs/sift' },
        url: 'https://signupdoggy.pages.dev/vs/sift',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://signupdoggy.pages.dev/' },
          { '@type': 'ListItem', position: 2, name: 'Compare', item: 'https://signupdoggy.pages.dev/vs' },
          { '@type': 'ListItem', position: 3, name: 'vs Sift', item: 'https://signupdoggy.pages.dev/vs/sift' },
        ],
      },
    ],
  },

  vsTurnstile: {
    path: '/vs/cloudflare-turnstile',
    title: 'Cloudflare Turnstile vs a server-side fraud API: which actually wins?',
    description:
      'Cloudflare Turnstile is free and frictionless. A server-side fraud API costs $0.01 per call. Here is the 2-stage funnel pattern that uses both, with the full Node.js integration code.',
    keywords: 'Turnstile alternative, Turnstile vs fraud API, Cloudflare Turnstile vs SignupDoggy',
    canonical: 'https://signupdoggy.pages.dev/vs/cloudflare-turnstile',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Cloudflare Turnstile vs a server-side fraud API — which actually wins?',
        description: 'Comparison of Cloudflare Turnstile and a server-side fraud API for SaaS signups.',
        datePublished: '2026-06-20',
        dateModified: '2026-06-20',
        inLanguage: 'en-US',
        author: { '@type': 'Person', name: 'Jeffrin James', email: 'mailto:jeffrinjames99@gmail.com' },
        publisher: { '@type': 'Organization', name: 'SignupDoggy', url: 'https://signupdoggy.pages.dev', logo: { '@type': 'ImageObject', url: 'https://signupdoggy.pages.dev/android-chrome-512x512.png' } },
        mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://signupdoggy.pages.dev/vs/cloudflare-turnstile' },
        url: 'https://signupdoggy.pages.dev/vs/cloudflare-turnstile',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://signupdoggy.pages.dev/' },
          { '@type': 'ListItem', position: 2, name: 'Compare', item: 'https://signupdoggy.pages.dev/vs' },
          { '@type': 'ListItem', position: 3, name: 'vs Cloudflare Turnstile', item: 'https://signupdoggy.pages.dev/vs/cloudflare-turnstile' },
        ],
      },
    ],
  },

  // ═══ USE-CASE PAGES (long-tail, high buyer intent) ═══════════════════════
  useIndieHackers: {
    path: '/use-cases/indie-hackers',
    title: 'Fraud detection API for indie hackers — SignupDoggy',
    description:
      'SignupDoggy is the fraud-detection API built for indie hackers. $0.01 per call, $5 minimum, no sales call, no monthly fee. Filter bot signups from your SaaS without a 4-week vendor onboarding.',
    keywords: 'fraud detection API for indie hackers, signup API indie, cheap fraud API, indie hacker signup validation',
    canonical: 'https://signupdoggy.pages.dev/use-cases/indie-hackers',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Fraud detection API for indie hackers',
        url: 'https://signupdoggy.pages.dev/use-cases/indie-hackers',
        description: 'How indie hackers use SignupDoggy to filter bot signups without enterprise pricing or vendor onboarding.',
        isPartOf: { '@type': 'WebSite', name: 'SignupDoggy', url: 'https://signupdoggy.pages.dev' },
        about: { '@type': 'Thing', name: 'Fraud detection for SaaS signups' },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://signupdoggy.pages.dev/' },
          { '@type': 'ListItem', position: 2, name: 'Use cases', item: 'https://signupdoggy.pages.dev/use-cases' },
          { '@type': 'ListItem', position: 3, name: 'Indie hackers', item: 'https://signupdoggy.pages.dev/use-cases/indie-hackers' },
        ],
      },
    ],
  },

  useSaasStartups: {
    path: '/use-cases/saas-startups',
    title: 'Fraud detection for SaaS startups — SignupDoggy',
    description:
      'How 2-50 person SaaS teams use SignupDoggy to keep their signup funnels clean, their Mixpanel data honest, and their support inbox free of bot-related tickets. Pricing, integration code, and the 2-stage funnel pattern.',
    keywords: 'fraud detection SaaS startup, signup validation SaaS, bot detection for SaaS, anti-fraud API for startups',
    canonical: 'https://signupdoggy.pages.dev/use-cases/saas-startups',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Fraud detection for SaaS startups',
        url: 'https://signupdoggy.pages.dev/use-cases/saas-startups',
        description: 'How SaaS startups use SignupDoggy to filter bot signups and keep their funnel data clean.',
        isPartOf: { '@type': 'WebSite', name: 'SignupDoggy', url: 'https://signupdoggy.pages.dev' },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://signupdoggy.pages.dev/' },
          { '@type': 'ListItem', position: 2, name: 'Use cases', item: 'https://signupdoggy.pages.dev/use-cases' },
          { '@type': 'ListItem', position: 3, name: 'SaaS startups', item: 'https://signupdoggy.pages.dev/use-cases/saas-startups' },
        ],
      },
    ],
  },

  useEcommerce: {
    path: '/use-cases/ecommerce',
    title: 'Fraud detection for e-commerce and marketplaces — SignupDoggy',
    description:
      'How e-commerce platforms and marketplaces use SignupDoggy to filter account creation fraud, prevent promo abuse, and stop fake reviews. Plus how to combine with payment-fraud detection like Stripe Radar.',
    keywords: 'fraud detection ecommerce, marketplace fraud API, account fraud ecommerce, fake signup detection',
    canonical: 'https://signupdoggy.pages.dev/use-cases/ecommerce',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Fraud detection for e-commerce and marketplaces',
        url: 'https://signupdoggy.pages.dev/use-cases/ecommerce',
        description: 'How e-commerce platforms use SignupDoggy to filter account creation fraud.',
        isPartOf: { '@type': 'WebSite', name: 'SignupDoggy', url: 'https://signupdoggy.pages.dev' },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://signupdoggy.pages.dev/' },
          { '@type': 'ListItem', position: 2, name: 'Use cases', item: 'https://signupdoggy.pages.dev/use-cases' },
          { '@type': 'ListItem', position: 3, name: 'E-commerce', item: 'https://signupdoggy.pages.dev/use-cases/ecommerce' },
        ],
      },
    ],
  },

  // ═══ INTEGRATIONS PAGE ═══════════════════════════════════════════════════
  integrations: {
    path: '/integrations',
    title: 'Integrations — Supabase, Cloudflare Workers, Next.js, Node, Python',
    description:
      'SignupDoggy integrates with everything: Supabase Auth, Cloudflare Workers, Next.js, Express, FastAPI, Django, and more. Working code for each, plus the 2-stage funnel pattern.',
    keywords: 'SignupDoggy integrations, Supabase Auth integration, Cloudflare Workers, Next.js, Node.js, Python, FastAPI, fraud API integrations',
    canonical: 'https://signupdoggy.pages.dev/integrations',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'SignupDoggy integrations',
        url: 'https://signupdoggy.pages.dev/integrations',
        description: 'How to integrate SignupDoggy with Supabase, Cloudflare Workers, Next.js, Node.js, Python, and more.',
        isPartOf: { '@type': 'WebSite', name: 'SignupDoggy', url: 'https://signupdoggy.pages.dev' },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://signupdoggy.pages.dev/' },
          { '@type': 'ListItem', position: 2, name: 'Integrations', item: 'https://signupdoggy.pages.dev/integrations' },
        ],
      },
    ],
  },

  // ═══ CHANGELOG ═══════════════════════════════════════════════════════════
  changelog: {
    path: '/changelog',
    title: 'Changelog — SignupDoggy',
    description:
      'Every product change, every blocklist update, every new feature. The SignupDoggy changelog, updated weekly.',
    keywords: 'SignupDoggy changelog, product updates, release notes, signup quality updates',
    canonical: 'https://signupdoggy.pages.dev/changelog',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'SignupDoggy changelog',
        url: 'https://signupdoggy.pages.dev/changelog',
        description: 'Product updates and release notes for SignupDoggy.',
        isPartOf: { '@type': 'WebSite', name: 'SignupDoggy', url: 'https://signupdoggy.pages.dev' },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://signupdoggy.pages.dev/' },
          { '@type': 'ListItem', position: 2, name: 'Changelog', item: 'https://signupdoggy.pages.dev/changelog' },
        ],
      },
    ],
  },

  // ═══ AUTHOR PAGE (E-E-A-T signal) ═══════════════════════════════════════
  author: {
    path: '/author/jeffrin-james',
    title: 'Jeffrin James — Founder of SignupDoggy',
    description:
      'Jeffrin James is the founder of SignupDoggy, a serverless fraud-detection API for indie hackers and small SaaS teams. Six years building fraud-detection systems, one-person operation, Mumbai India.',
    keywords: 'Jeffrin James, SignupDoggy founder, fraud detection engineer, indie hacker, Mumbai India',
    canonical: 'https://signupdoggy.pages.dev/author/jeffrin-james',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        mainEntity: {
          '@type': 'Person',
          name: 'Jeffrin James',
          jobTitle: 'Founder & Solo Developer',
          description: 'Founder of SignupDoggy. Six years building fraud-detection systems. One-person operation based in Mumbai, India.',
          url: 'https://signupdoggy.pages.dev/author/jeffrin-james',
          email: 'mailto:jeffrinjames99@gmail.com',
          knowsAbout: ['Fraud detection', 'Disposable email detection', 'VPN and Tor detection', 'SaaS signup flows', 'Indie SaaS', 'Cloudflare Workers'],
          worksFor: { '@type': 'Organization', name: 'SignupDoggy', url: 'https://signupdoggy.pages.dev' },
          address: { '@type': 'PostalAddress', addressLocality: 'Mumbai', addressCountry: 'IN' },
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://signupdoggy.pages.dev/' },
          { '@type': 'ListItem', position: 2, name: 'Author', item: 'https://signupdoggy.pages.dev/author' },
          { '@type': 'ListItem', position: 3, name: 'Jeffrin James', item: 'https://signupdoggy.pages.dev/author/jeffrin-james' },
        ],
      },
    ],
  },

  // ═══ TOPICS HUB (pillar content) ═══════════════════════════════════════
  topics: {
    path: '/topics',
    title: 'Topics — SignupDoggy Blog',
    description:
      'All SignupDoggy blog posts grouped by topic: disposable email detection, VPN/Tor detection, fraud API comparisons, signup form optimization, and more.',
    keywords: 'signupdoggy topics, disposable email detection, VPN detection, fraud API comparison, signup form',
    canonical: 'https://signupdoggy.pages.dev/topics',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Topics — SignupDoggy Blog',
        description: 'All SignupDoggy blog posts grouped by topic.',
        url: 'https://signupdoggy.pages.dev/topics',
        isPartOf: { '@type': 'WebSite', name: 'SignupDoggy', url: 'https://signupdoggy.pages.dev' },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://signupdoggy.pages.dev/' },
          { '@type': 'ListItem', position: 2, name: 'Topics', item: 'https://signupdoggy.pages.dev/topics' },
        ],
      },
    ],
  },

  // ═══ FREE TOOL: DISPOSABLE EMAIL CHECKER ═════════════════════════════
  // High search-volume landing page for "disposable email checker" queries.
  // The component lives at /pages/DisposableChecker.tsx and the body text
  // is loaded separately (see loadStaticBodies in scripts/prerender.mjs).
  disposableChecker: {
    path: '/disposable-checker',
    title: 'Free Disposable Email Checker — SignupDoggy',
    description:
      'Free, instant, in-browser disposable email checker. Type an email — get a verdict. No signup, no API key, no tracking. Checks against 200,000+ disposable providers. Used by indie SaaS teams and solo founders.',
    keywords:
      'disposable email checker, free disposable email checker, temp mail checker, throwaway email detector, tempmail check, mailinator detector, email validation, signup validation, signupdoggy',
    canonical: 'https://signupdoggy.pages.dev/disposable-checker',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'SignupDoggy Disposable Email Checker',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any (browser)',
        description:
          'Free browser-based tool that checks whether an email address is from a disposable, temporary, or throwaway provider. Uses a 200,000+ domain blocklist. No signup, no API key, no tracking — the check runs entirely client-side.',
        url: 'https://signupdoggy.pages.dev/disposable-checker',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: [
          '200,000+ disposable domain blocklist',
          'Role-based email detection (admin@, support@, etc.)',
          'Free email provider detection (gmail, yahoo, outlook)',
          'Runs entirely client-side — no data leaves the browser',
          'No signup, no API key, no credit card',
        ],
        creator: { '@type': 'Organization', name: 'SignupDoggy', url: 'https://signupdoggy.pages.dev' },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Is this disposable email checker really free?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. No signup, no API key, no credit card. The check runs entirely in your browser using a 200,000+ domain blocklist. The email is never sent to any server — open the browser network tab to verify.',
            },
          },
          {
            '@type': 'Question',
            name: 'How accurate is the disposable email detection?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The same blocklist that powers the paid SignupDoggy API catches ~99% of disposable emails. The free tool is updated monthly; the paid API is updated daily.',
            },
          },
          {
            '@type': 'Question',
            name: 'Do you save the emails I check?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. The check happens entirely in your browser. The email is not transmitted to any server and is not stored in any database. Your recent checks live only in your browser session memory.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I embed this tool on my site?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Contact jeffrinjames99@gmail.com for the embed code. The tool ships as a single React component plus the bundled blocklist (~32 KB gzipped).',
            },
          },
          {
            '@type': 'Question',
            name: 'How is this different from the SignupDoggy API?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The free tool checks one email at a time and only the email. The paid API (POST /v1/check) checks email + IP + phone in one call, returns a 0–1 risk score with allow/review/block recommendation, and updates the blocklist daily instead of monthly.',
            },
          },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://signupdoggy.pages.dev/' },
          { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://signupdoggy.pages.dev/disposable-checker' },
          { '@type': 'ListItem', position: 3, name: 'Disposable Email Checker', item: 'https://signupdoggy.pages.dev/disposable-checker' },
        ],
      },
    ],
  },

  // ═══ GLOSSARY ═════════════════════════════════════════════════════════
  // Educational pillar page that ranks for "what is X" queries in the
  // signup-quality / fraud-detection space.
  glossary: {
    path: '/glossary',
    title: 'Signup Quality Glossary — SignupDoggy',
    description:
      'A glossary of signup-quality, fraud-detection, and email-validation terms: disposable email, role-based email, MX record, Tor exit node, VPN/hosting ASN, IP risk score, bot detection, and more.',
    keywords:
      'signup quality glossary, fraud detection terms, disposable email definition, VPN detection glossary, Tor exit node, IP risk score, bot detection',
    canonical: 'https://signupdoggy.pages.dev/glossary',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'DefinedTermSet',
        name: 'SignupDoggy Glossary',
        description: 'Glossary of signup-quality and fraud-detection terms.',
        url: 'https://signupdoggy.pages.dev/glossary',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://signupdoggy.pages.dev/' },
          { '@type': 'ListItem', position: 2, name: 'Glossary', item: 'https://signupdoggy.pages.dev/glossary' },
        ],
      },
    ],
  },

  // ═══ ALTERNATIVES HUB ═════════════════════════════════════════════════
  // "X alternative" pages are high-buyer-intent. We list every major
  // competitor so each /alternatives/<slug> page can rank.
  alternatives: {
    path: '/alternatives',
    title: 'SignupDoggy Alternatives — Compare every fraud-detection API (2026)',
    description:
      'A side-by-side comparison of every fraud-detection and signup-validation API that competes with SignupDoggy. Includes IPQualityScore, MaxMind, Sift, Cloudflare Turnstile, hCaptcha, SEON, and Onfido. Pricing, accuracy, integration time.',
    keywords:
      'SignupDoggy alternatives, fraud API alternatives, IPQualityScore alternative, MaxMind alternative, Sift alternative, signup validation API',
    canonical: 'https://signupdoggy.pages.dev/alternatives',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'SignupDoggy Alternatives',
        description: 'Side-by-side comparison of fraud-detection APIs.',
        url: 'https://signupdoggy.pages.dev/alternatives',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://signupdoggy.pages.dev/' },
          { '@type': 'ListItem', position: 2, name: 'Alternatives', item: 'https://signupdoggy.pages.dev/alternatives' },
        ],
      },
    ],
  },
};

// Per-blog-post configs live next to the post registry so adding a
// post auto-registers its SEO config. We import from posts.ts at
// call sites; this lookup is generated by getBlogPostSeo().
