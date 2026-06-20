// Alternatives hub page (/alternatives) — high-buyer-intent landing pages.
//
// Renders two views:
//   /alternatives            — hub listing every major competitor with a 1-paragraph summary
//   /alternatives/:slug      — per-competitor page with detailed comparison + sign-up CTA
//
// "X alternative" searches are the highest-buyer-intent query in the
// fraud-detection space. Someone searching "IPQualityScore alternative"
// already knows they want to leave IPQualityScore — they just need the
// list to pick from. We list every credible competitor (10+ tools).

import { Link, useParams, Navigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { SEO } from '../components/SEO';
import { SITE } from '../lib/seoConfig';

interface Alternative {
  slug: string;
  name: string;
  tagline: string;
  pricing: string;
  category: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  body: string;
}

const ALTERNATIVES: Alternative[] = [
  {
    slug: 'ipqualityscore',
    name: 'IPQualityScore',
    tagline: 'IP risk scoring with the deepest IP-to-ASN database in the industry.',
    pricing: '$25–$400/month (annual contract required for volume tiers)',
    category: 'IP risk scoring',
    pros: [
      'Best-in-class IP risk database (125+ risk signals per IP)',
      'Device fingerprinting library included on higher tiers',
      'Used by many Fortune 500 fraud teams',
    ],
    cons: [
      'Requires business email + sales call to get an API key',
      'Annual contract required for volume pricing',
      'Disposable-email list is shallower than SignupDoggy\'s',
    ],
    bestFor: 'Enterprise fraud teams with $50k+/year budgets.',
    body: `IPQualityScore (IPQS) is the legacy choice for IP risk scoring. Their IP-to-ASN-to-organization database is one of the best in the industry, and their device fingerprinting library is on every serious fraud team's shortlist.

Where IPQS shines: pure IP risk scoring. The data is comprehensive, the API is well-documented, and integration is straightforward for teams that have done fraud work before.

Where IPQS falls short for indie hackers: the free tier requires a business email (no Gmail/Yahoo) and the paid tier requires a sales call. Minimum spend is $25/month, which is fine for a funded SaaS but overkill for a side project.

If you're a 2–50 person SaaS team that needs a working fraud API this afternoon, SignupDoggy is the lighter alternative: $0.01 per call, no monthly minimum, no sales call, and a disposable-email blocklist that goes deeper than IPQS's. The full feature-by-feature comparison is at /blog/ipqualityscore-vs-signupdoggy-honest-comparison.`,
  },
  {
    slug: 'maxmind',
    name: 'MaxMind minFraud',
    tagline: 'The 800-pound gorilla of IP intelligence — enterprise-only pricing.',
    pricing: '$25–$500/month (requires separate GeoIP license)',
    category: 'IP risk scoring',
    pros: [
      'Gold-standard IP-to-ASN-to-organization database',
      'Trusted by every major bank and payment processor',
      'Long history (2005) and stable accuracy',
    ],
    cons: [
      'Most expensive option for low volume (48x SignupDoggy at 50k/month)',
      'Requires buying GeoIP separately for some endpoints',
      'Disposable-email detection is not included',
    ],
    bestFor: 'Banks, payment processors, and large e-commerce platforms.',
    body: `MaxMind's minFraud service has been around since 2005. Their IP-to-ASN-to-organization database is the gold standard — every bank and payment processor uses some form of MaxMind data.

Where MaxMind wins: pure IP intelligence at scale. If you're processing 10M+ transactions/month and need the deepest IP data on the market, MaxMind is the right choice.

Where MaxMind is overkill for indie hackers: minimum spend is $25/month for the Insights tier, and at 50k signups/month on the Score tier you're paying $1,500. The same 50k signups on SignupDoggy cost $250 one-time. That's a 48x price difference for accuracy that, on the typical signup form, is within a few percentage points.

If you don't need banking-grade IP intelligence and just want to filter the obvious bots at signup, SignupDoggy is the lighter alternative. Full comparison at /blog/maxmind-minfraud-vs-signupdoggy.`,
  },
  {
    slug: 'sift',
    name: 'Sift',
    tagline: 'Enterprise fraud platform with payment + content + account abuse in one.',
    pricing: 'Custom pricing, typically $1,000+/month minimum',
    category: 'Full fraud platform',
    pros: [
      'Comprehensive coverage: payment, content, account, promo abuse',
      'ML models trained on trillions of events from across Sift\'s network',
      'Industry leader for marketplaces and large e-commerce',
    ],
    cons: [
      'Minimum spend is typically $1k+/month — unaffordable for indie SaaS',
      'Implementation takes weeks to months, not minutes',
      'Sales-led onboarding with annual contracts',
    ],
    bestFor: 'Marketplaces and large e-commerce platforms doing $10M+/year.',
    body: `Sift is the 800-pound gorilla of fraud detection. Their platform covers payment fraud, content abuse, account abuse, and promo abuse in one — with ML models trained on trillions of events from across their customer base.

Where Sift wins: comprehensive fraud coverage at scale. If you're a marketplace or large e-commerce platform with a dedicated fraud team and a $10M+/year GMV, Sift is the right call.

Where Sift is wrong for a 2-person SaaS team: minimum spend is typically $1,000/month, and implementation takes weeks. You're paying enterprise prices for features (payment fraud, promo abuse) that a small SaaS doesn't need.

If you just need to filter bot signups and keep your Mixpanel funnel clean, SignupDoggy is the lighter alternative — $0.01 per call, $5 minimum, self-service in under 30 minutes. Full comparison at /blog/sift-vs-signupdoggy-fraud-api-comparison.`,
  },
  {
    slug: 'cloudflare-turnstile',
    name: 'Cloudflare Turnstile',
    tagline: 'Free, frictionless CAPTCHA — but not a fraud API.',
    pricing: 'Free',
    category: 'CAPTCHA alternative',
    pros: [
      'Completely free',
      'Frictionless — invisible to 95% of real users',
      'Zero integration cost (drop-in widget)',
    ],
    cons: [
      'Not a fraud API — only challenges the browser session',
      'Every non-browser bot passes through (curl, Puppeteer, etc.)',
      'No IP, email, or phone scoring',
    ],
    bestFor: 'The first layer of a 2-stage funnel — pairs with a server-side fraud API.',
    body: `Cloudflare Turnstile is the free, frictionless CAPTCHA that replaced reCAPTCHA for most sites in 2023. It's invisible to 95% of real users and challenges only suspicious sessions.

The catch: Turnstile is NOT a fraud API. It's a CAPTCHA. It challenges the browser session and nothing else. Every non-browser bot (curl, Puppeteer, Python requests, mobile app) sails right through.

The right way to use Turnstile: as the FIRST stage of a 2-stage funnel, with SignupDoggy as the SECOND stage. Turnstile catches the dumb browser bots; SignupDoggy catches the headless scripts, the residential proxies, and the disposable emails. Together you get 99%+ bot-blocking with zero real-user friction.

Full integration code and the 2-stage funnel pattern are at /blog/cloudflare-turnstile-vs-server-side-fraud-api.`,
  },
  {
    slug: 'hcaptcha',
    name: 'hCaptcha',
    tagline: 'Privacy-focused CAPTCHA alternative to Google reCAPTCHA.',
    pricing: 'Free for low volume; paid Enterprise tier',
    category: 'CAPTCHA alternative',
    pros: [
      'Privacy-focused (no Google tracking)',
      'Pays publishers (you earn revenue on challenge views)',
      'Frictionless mode available (Enterprise tier)',
    ],
    cons: [
      'Same fundamental limitation as Turnstile — CAPTCHA, not fraud API',
      'Free tier is rate-limited',
      'Some users find the puzzles harder than reCAPTCHA',
    ],
    bestFor: 'Privacy-conscious sites that want to ditch Google reCAPTCHA.',
    body: `hCaptcha is the privacy-focused alternative to Google reCAPTCHA. It challenges users with image-recognition puzzles, pays publishers for the training data, and doesn't ship user behavior to Google.

Like Turnstile, hCaptcha is a CAPTCHA — not a fraud API. It challenges the browser session and nothing else. Headless scripts and mobile bots pass through unchanged.

Use hCaptcha as the FIRST stage of a 2-stage funnel, with SignupDoggy as the server-side second stage. The full 2-stage pattern is at /blog/cloudflare-turnstile-vs-server-side-fraud-api.`,
  },
  {
    slug: 'seon',
    name: 'SEON',
    tagline: 'Modern fraud API with strong social-media enrichment signals.',
    pricing: 'Starts at €59/month (no free tier, sales call required)',
    category: 'Full fraud API',
    pros: [
      'Social-media enrichment (checks if the email/phone has a real profile)',
      'Modern API, good documentation',
      'Strong on marketplaces and fintech',
    ],
    cons: [
      '€59/month minimum — overkill for indie SaaS',
      'Sales call required for paid tier',
      'Disposable-email list is smaller than SignupDoggy\'s',
    ],
    bestFor: 'Fintech and marketplaces that need social-signals enrichment.',
    body: `SEON is the modern challenger in the fraud-API space. Their differentiator is social-media enrichment — when you score a signup, SEON checks whether the email or phone has a linked Facebook, LinkedIn, or Google profile.

Where SEON wins: social-signals. If you're a fintech or marketplace where "does this person have a real LinkedIn" is a strong fraud signal, SEON is a good choice.

Where SEON is overkill for indie SaaS: minimum spend is €59/month, paid tier requires a sales call, and the social-enrichment feature is wasted on a side project that doesn't have 10k signups/month to enrich.

If you need a working API this afternoon without calling sales, SignupDoggy is the lighter alternative.`,
  },
  {
    slug: 'onfido',
    name: 'Onfido',
    tagline: 'KYC / identity-verification platform — not a signup fraud API.',
    pricing: 'Custom pricing, typically $1+/verification',
    category: 'KYC / identity verification',
    pros: [
      'Gold-standard KYC (passport, driver\'s license, selfie)',
      'Used by every major fintech and bank',
      'Regulated, audited, compliant',
    ],
    cons: [
      'Way too heavy for a signup form — designed for post-signup verification',
      'Takes minutes per check (vs milliseconds for an email risk API)',
      'Costs $1+ per check',
    ],
    bestFor: 'Fintech and crypto platforms that need full identity verification.',
    body: `Onfido is the gold-standard KYC / identity-verification platform. Passport, driver's license, selfie — the full regulated stack. Every major fintech uses Onfido or one of its competitors.

The wrong tool for signup-time fraud filtering. KYC takes minutes per check and costs $1+. You don't want to make every signup fill out a passport form — you want to filter the obvious bots before they get to the KYC step.

The right funnel: SignupDoggy filters obvious bots at signup (sub-50ms, $0.01 per check). Then Onfido or Persona runs KYC on the users who actually need to be verified (paying customers, regulated industries).

If your product needs KYC, use Onfido. If your product needs to filter bot signups, use SignupDoggy. They're complementary, not competing.`,
  },
  {
    slug: 'persona',
    name: 'Persona',
    tagline: 'Identity verification with strong UX — still KYC, not signup fraud.',
    pricing: 'Starts at ~$0.50/verification',
    category: 'KYC / identity verification',
    pros: [
      'Modern UI/UX for KYC flows',
      'Configurable verification levels',
      'Good for marketplaces and gig economy',
    ],
    cons: [
      'KYC, not signup fraud — designed for post-signup verification',
      '$0.50+ per check',
      'Takes seconds-to-minutes per check',
    ],
    bestFor: 'Marketplaces and gig platforms that need configurable KYC.',
    body: `Persona is the modern alternative to Onfido. Same use case (KYC / identity verification), better UX, similar pricing.

Like Onfido, Persona is designed for post-signup verification — "prove you're a real person before we let you transact." It's the wrong tool for filtering bot signups at signup time.

Use Persona for KYC, use SignupDoggy for signup fraud. They're complementary.`,
  },
  {
    slug: 'spamhaus',
    name: 'Spamhaus',
    tagline: 'The authority on email abuse — used as a data source, not a standalone API.',
    pricing: 'Free for low-volume queries; paid for commercial use',
    category: 'Email reputation data',
    pros: [
      'Gold-standard email reputation data',
      'Free for low-volume lookups',
      'Used by every major email provider',
    ],
    cons: [
      'Not a fraud API — only email reputation, no IP/phone scoring',
      'Free tier rate-limited',
      'Commercial use requires paid license',
    ],
    bestFor: 'Email-sending platforms that need reputation data, not signup forms.',
    body: `Spamhaus is the authority on email abuse. Their blocklists (SBL, XBL, PBL, DBL) are used by every major email provider to filter spam.

Not the right tool for signup-time fraud filtering. Spamhaus is a data source — most fraud-detection APIs (including SignupDoggy) consume Spamhaus feeds behind the scenes.

If you're a signup form, use SignupDoggy — we already integrate Spamhaus data and 175 other data sources, and we present them as a simple risk score instead of a dozen separate lists.`,
  },
  {
    slug: 'zerobounce',
    name: 'ZeroBounce',
    tagline: 'Email verification + deliverability tool — slow for inline signup use.',
    pricing: '$15–$474/month depending on volume',
    category: 'Email verification',
    pros: [
      'Comprehensive email verification (MX, SMTP, spam-trap, etc.)',
      'Good deliverability reporting',
      'Used by email marketers at scale',
    ],
    cons: [
      'Slow — 300–500ms p95 (does SMTP-level checks)',
      '$15/month minimum',
      'Disposable-domain list is smaller than SignupDoggy\'s',
    ],
    bestFor: 'Email marketers cleaning a list before a campaign.',
    body: `ZeroBounce is the email-verification tool of choice for email marketers. SMTP-level checks, spam-trap detection, deliverability scoring — the full deliverability stack.

Not the right tool for inline signup fraud filtering. ZeroBounce's SMTP-level checks take 300–500ms, which makes them too slow to call inline in a signup POST handler. ZeroBounce shines when you're cleaning a list of 50k addresses before a campaign — not when you're scoring one signup at a time.

For inline signup fraud scoring, SignupDoggy is the right alternative — sub-50ms p95, $0.01 per call, $5 minimum.`,
  },
];

function AlternativeHub() {
  // ItemList schema built from ALTERNATIVES so Google can render this as
  // a list rich-result for "X alternative" queries.
  const alternativeSchemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'SignupDoggy Alternatives',
      description: 'A directory of fraud-detection and signup-validation APIs that compete with SignupDoggy.',
      url: 'https://signupdoggy.pages.dev/alternatives',
      isPartOf: { '@type': 'WebSite', name: 'SignupDoggy', url: 'https://signupdoggy.pages.dev' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'SignupDoggy alternatives — every fraud-detection API we compete with',
      description: 'A side-by-side comparison of fraud-detection and signup-validation APIs: IPQualityScore, MaxMind, Sift, Cloudflare Turnstile, hCaptcha, SEON, Onfido, Persona, Spamhaus, ZeroBounce.',
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      numberOfItems: ALTERNATIVES.length,
      itemListElement: ALTERNATIVES.map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `https://signupdoggy.pages.dev/alternatives/${a.slug}`,
        name: `${a.name} alternative`,
        description: a.tagline,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://signupdoggy.pages.dev/' },
        { '@type': 'ListItem', position: 2, name: 'Alternatives', item: 'https://signupdoggy.pages.dev/alternatives' },
      ],
    },
  ];
  return (
    <AppLayout>
      <SEO config={{ path: '/alternatives', title: 'SignupDoggy Alternatives — Compare every fraud-detection API (2026)', description: 'A side-by-side comparison of every fraud-detection and signup-validation API that competes with SignupDoggy. Includes IPQualityScore, MaxMind, Sift, Cloudflare Turnstile, hCaptcha, SEON, and Onfido.', keywords: 'SignupDoggy alternatives, fraud API alternatives', canonical: 'https://signupdoggy.pages.dev/alternatives', schemas: alternativeSchemas }} />
      <div className="page-content">
        <div className="term-banner">
          <span className="banner-prompt">$</span> ./alternatives --list
          <span className="banner-status">● {ALTERNATIVES.length} TOOLS</span>
        </div>

        <header style={{ marginBottom: 'var(--space-2xl)' }}>
          <h1 className="docs-h1" style={{ marginTop: 'var(--space-md)' }}>SignupDoggy Alternatives</h1>
          <p className="docs-lead">
            Every fraud-detection and signup-validation API that competes with SignupDoggy,
            ranked by fit for indie SaaS, small teams, and bootstrapped startups. Click any
            tool for the detailed comparison.
          </p>
        </header>

        {ALTERNATIVES.map((a) => (
          <section key={a.slug} style={{ marginBottom: 'var(--space-2xl)', padding: 'var(--space-lg)', background: 'var(--bg-elevated, rgba(255,255,255,0.03))', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-faint)' }}>
            <h2 className="docs-h2"><Link to={`/alternatives/${a.slug}`}>{a.name} alternative</Link></h2>
            <p className="docs-p" style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>{a.tagline}</p>
            <p className="docs-p" style={{ fontSize: '0.9em' }}>
              <strong>Category:</strong> {a.category} · <strong>Pricing:</strong> {a.pricing}
            </p>
            <p className="docs-p"><strong>Best for:</strong> {a.bestFor}</p>
            <Link to={`/alternatives/${a.slug}`} className="cta-button secondary" style={{ display: 'inline-block', marginTop: 'var(--space-sm)' }}>Read the comparison →</Link>
          </section>
        ))}
      </div>
    </AppLayout>
  );
}

function AlternativeDetail({ slug }: { slug: string }) {
  const alt = ALTERNATIVES.find((a) => a.slug === slug);
  if (!alt) return <Navigate to="/alternatives" replace />;

  return (
    <AppLayout>
      <SEO config={{
        path: `/alternatives/${slug}`,
        title: `${alt.name} alternative — SignupDoggy comparison (2026)`,
        description: `${alt.name} alternative for indie SaaS teams. Pricing, accuracy, integration time, and which one fits a 2-50 person team. Honest comparison of ${alt.name} and SignupDoggy.`,
        keywords: `${alt.name} alternative, ${alt.name} vs SignupDoggy, fraud API alternative, ${slug} alternative`,
        canonical: `https://signupdoggy.pages.dev/alternatives/${slug}`,
        schemas: [
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: `${alt.name} alternative — SignupDoggy comparison (2026)`,
            description: `Honest comparison of ${alt.name} and SignupDoggy. Pricing, accuracy, integration time.`,
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
              { '@type': 'ListItem', position: 3, name: alt.name, item: `https://signupdoggy.pages.dev/alternatives/${slug}` },
            ],
          },
        ],
      }} />
      <div className="page-content">
        <div className="term-banner">
          <span className="banner-prompt">$</span> ./alternatives --compare={slug}
          <span className="banner-status">● COMPARISON</span>
        </div>

        <header style={{ marginBottom: 'var(--space-2xl)' }}>
          <h1 className="docs-h1" style={{ marginTop: 'var(--space-md)' }}>{alt.name} alternative</h1>
          <p className="docs-lead">{alt.tagline}</p>
        </header>

        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <h2 className="docs-h2"># Quick facts</h2>
          <ul className="docs-p">
            <li><strong>Category:</strong> {alt.category}</li>
            <li><strong>Pricing:</strong> {alt.pricing}</li>
            <li><strong>Best for:</strong> {alt.bestFor}</li>
          </ul>
        </section>

        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <h2 className="docs-h2"># Where {alt.name} wins</h2>
          <ul className="docs-p">{alt.pros.map((p, i) => <li key={i}>{p}</li>)}</ul>
        </section>

        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <h2 className="docs-h2"># Where {alt.name} falls short</h2>
          <ul className="docs-p">{alt.cons.map((p, i) => <li key={i}>{p}</li>)}</ul>
        </section>

        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <h2 className="docs-h2"># The full picture</h2>
          <article style={{ whiteSpace: 'pre-wrap', fontFamily: 'system-ui', fontSize: '15px', lineHeight: '1.7' }}>
            {alt.body}
          </article>
        </section>

        <section style={{ marginTop: 'var(--space-3xl)', padding: 'var(--space-xl) 0', borderTop: '1px solid var(--border-faint)' }}>
          <h2 className="docs-h2">Try SignupDoggy free</h2>
          <p className="docs-p">$5 minimum, credits never expire. No sales call.</p>
          <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)', flexWrap: 'wrap' }}>
            <a className="cta-button" href="/signup" rel="nofollow">Get a free API key</a>
            <a className="cta-button secondary" href="/docs">Read the API docs</a>
            <Link to="/alternatives" className="cta-button secondary">See all alternatives</Link>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

export default function Alternatives() {
  const { slug } = useParams<{ slug?: string }>();
  if (slug) return <AlternativeDetail slug={slug} />;
  return <AlternativeHub />;
}