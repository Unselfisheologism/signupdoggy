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
};

// Per-blog-post configs live next to the post registry so adding a
// post auto-registers its SEO config. We import from posts.ts at
// call sites; this lookup is generated by getBlogPostSeo().
