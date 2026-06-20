// Glossary page (/glossary) — educational pillar content.
//
// Ranks for "what is X" queries in the signup-quality / fraud-detection
// space. Each term gets a definition, an example, and an internal link
// to the most relevant blog post or product page for deeper reading.
//
// This is the same pillar-content pattern used by Stripe, Twilio, and
// other top-SEO SaaS sites. Definitions stay short (50-150 words each)
// so the page ranks for the head term AND for each definition as a
// featured snippet.

import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { SEO } from '../components/SEO';
import { SITE, ROUTES as SEO_ROUTES } from '../lib/seoConfig';

interface GlossaryTerm {
  term: string;
  slug: string;
  definition: string;
  example: string;
  relatedLinks: { label: string; href: string }[];
}

const TERMS: GlossaryTerm[] = [
  {
    term: 'Disposable email',
    slug: 'disposable-email',
    definition:
      'A disposable email (also: temporary email, throwaway email, burner email, fake email, temp mail) is an email address that self-destructs after a short window — usually 10 minutes to 24 hours. Used by bots, free-trial abusers, and privacy-conscious users. The six biggest providers are tempmail.com, guerrillamail.com, mailinator.com, 10minutemail.com, yopmail.com, and throwawaymail.com, which together account for ~60% of disposable signups. The remaining 40% is a long tail of ~200,000 smaller providers.',
    example: 'someone@tempmail.com — the @tempmail.com domain self-destructs the inbox after 10 minutes.',
    relatedLinks: [
      { label: 'Free Disposable Email Checker', href: '/disposable-checker' },
      { label: 'How to maintain a disposable email list (2026)', href: '/blog/disposable-email-list-2026-how-to-maintain' },
      { label: 'Disposable email detection in Node.js', href: '/blog/disposable-email-detection-nodejs-tutorial' },
    ],
  },
  {
    term: 'Role-based email',
    slug: 'role-based-email',
    definition:
      'A role-based email (also: role account, shared mailbox) is an address like admin@, support@, abuse@, sales@, or webmaster@. These are shared mailboxes, not personal inboxes — signups from them rarely convert and often belong to bots or competitors scraping your form. Most fraud-detection APIs flag role-based emails with a "caution" verdict instead of a hard block, because legitimate B2B SaaS customers sometimes use them.',
    example: 'support@stripe.com — goes to a shared Zendesk queue, not a real human signup.',
    relatedLinks: [
      { label: 'Email validation vs email verification', href: '/blog/email-validation-vs-email-verification' },
      { label: 'Disposable Email Checker', href: '/disposable-checker' },
    ],
  },
  {
    term: 'MX record',
    slug: 'mx-record',
    definition:
      'An MX (Mail Exchange) record is a DNS record that tells other mail servers where to deliver email for a domain. If a domain has no MX record, no real mail can be sent to it — every address @thatdomain is unreachable. A live MX check catches the long tail of disposable providers that spin up a new domain every 48 hours: the domain might be in yesterday\'s blocklist, but a fresh MX lookup reveals it\'s not yet configured to receive mail.',
    example: 'dig MX tempmail.com returns 5 servers; dig MX madeup-example-12345.com returns NXDOMAIN.',
    relatedLinks: [
      { label: 'Free Disposable Email Checker', href: '/disposable-checker' },
    ],
  },
  {
    term: 'Tor exit node',
    slug: 'tor-exit-node',
    definition:
      'A Tor exit node is the final relay in a Tor circuit — the IP address that traffic appears to come from when a user connects to your service through Tor. Tor exit nodes are publicly listed by The Tor Project and rotate every few hours. There are typically 6,000-9,000 active exit nodes at any moment; SignupDoggy tracks ~70,000 historical entries. Signups from Tor exit nodes are almost always bots, abusers, or journalists — never paying customers. Hard-block recommended.',
    example: '185.220.101.5 (a known Tor exit node) — listed in dan.me.uk\'s daily Tor exit list.',
    relatedLinks: [
      { label: 'How to block VPN and Tor signups (2026 playbook)', href: '/blog/how-to-block-vpn-and-tor-signups-without-blocking-real-users' },
      { label: 'VPN detection in Node.js', href: '/blog/how-to-detect-vpn-users-nodejs' },
    ],
  },
  {
    term: 'VPN / hosting ASN',
    slug: 'vpn-hosting-asn',
    definition:
      'An ASN (Autonomous System Number) is a unique number assigned to every IP block on the internet. Datacenter ASNs (DigitalOcean, Linode, Vultr, AWS, Hetzner) and VPN-provider ASNs (NordVPN, ExpressVPN, Mullvad) are owned by infrastructure providers — not residential ISPs. A signup from one of these ASNs is almost always a bot, a free-trial abuser, or a paid user hiding their location. ~24,000 ASNs are tracked by SignupDoggy.',
    example: 'AS14061 (DigitalOcean) — every IP in this block is a datacenter, not a home user.',
    relatedLinks: [
      { label: 'VPN detection in Node.js', href: '/blog/how-to-detect-vpn-users-nodejs' },
      { label: 'How to block VPN and Tor signups', href: '/blog/how-to-block-vpn-and-tor-signups-without-blocking-real-users' },
    ],
  },
  {
    term: 'IP risk score',
    slug: 'ip-risk-score',
    definition:
      'An IP risk score is a 0–1 number (or 0–100) representing how likely a given IP is to be associated with fraud. The score combines ASN type (datacenter / VPN / residential / mobile), geolocation, reputation lists, and behavioral signals. Scores above 0.7 typically warrant a hard block; scores 0.4–0.7 warrant a manual review (CAPTCHA or email confirmation); scores below 0.4 are usually safe to allow.',
    example: 'Score 0.92 → block (likely bot). Score 0.55 → review (ask for CAPTCHA). Score 0.12 → allow.',
    relatedLinks: [
      { label: 'How to stop bot signups without CAPTCHA', href: '/blog/how-to-stop-bot-signups-without-captcha' },
      { label: 'API reference', href: '/docs' },
    ],
  },
  {
    term: 'Bot signup',
    slug: 'bot-signup',
    definition:
      'A bot signup is a programmatic account creation — usually by a headless browser (Puppeteer, Playwright), a Python script with curl, or a botnet of residential proxies. Bot signups cost SaaS companies 5–30% of their signup volume, dilute funnels, pollute analytics, and waste support time. They\'re usually caught by a combination of disposable-email detection, IP risk scoring, and behavioral signals (mouse movement, time-on-page).',
    example: 'A 4-second signup from a Datacenter IP using a tempmail address, no JS executed — almost certainly a bot.',
    relatedLinks: [
      { label: 'How to stop bot signups without CAPTCHA', href: '/blog/how-to-stop-bot-signups-without-captcha' },
      { label: 'Cloudflare Turnstile vs a server-side fraud API', href: '/blog/cloudflare-turnstile-vs-server-side-fraud-api' },
    ],
  },
  {
    term: 'CAPTCHA',
    slug: 'captcha',
    definition:
      'A CAPTCHA (Completely Automated Public Turing test to tell Computers and Humans Apart) is a challenge-response test designed to distinguish humans from bots. The most common forms in 2026 are Google reCAPTCHA v3 (invisible), Cloudflare Turnstile (frictionless), and hCaptcha (privacy-focused). CAPTCHAs block 60–80% of naive bots but lose 5–15% of real users who abandon out of frustration. Best used as ONE signal among many, not the only signal.',
    example: 'Cloudflare Turnstile challenges only suspicious sessions, invisible to 95% of real users.',
    relatedLinks: [
      { label: 'Cloudflare Turnstile vs a server-side fraud API', href: '/blog/cloudflare-turnstile-vs-server-side-fraud-api' },
      { label: 'How to stop bot signups without CAPTCHA', href: '/blog/how-to-stop-bot-signups-without-captcha' },
    ],
  },
  {
    term: 'Email validation vs email verification',
    slug: 'email-validation-vs-verification',
    definition:
      'Email validation checks the FORMAT — does the address have an @ sign, a valid local part, a domain with a TLD. Cheap, fast (microseconds), catches typos. Email verification checks the MAILBOX — does the domain have MX records, does the SMTP server accept the recipient. Slower (100ms–2s), can be detected as spam by the recipient server, and gives a stronger guarantee of deliverability. Neither one is fraud detection — that\'s a third, separate problem.',
    example: '"user@gmial.com" passes validation but fails verification (mailbox doesn\'t exist). "user@gmail.com" passes both. "user@tempmail.com" passes both but is still fraud.',
    relatedLinks: [
      { label: 'Email validation vs verification (full post)', href: '/blog/email-validation-vs-email-verification' },
    ],
  },
  {
    term: 'Risk band / recommendation',
    slug: 'risk-band-recommendation',
    definition:
      'A risk band is a categorical label (low / medium / high) that fraud-detection APIs return alongside the numeric risk score. A recommendation is the action the API suggests (allow / review / block). Bands and recommendations are easier to use in business logic than raw scores — a 0.67 score might be "medium" for one SaaS (allow) and "high" for another (review), depending on the industry. Most APIs let you configure the thresholds per account.',
    example: 'score=0.83 → recommendation="block" for a B2B SaaS; same score might be "review" for a consumer app.',
    relatedLinks: [
      { label: 'API reference', href: '/docs' },
      { label: 'How to stop bot signups without CAPTCHA', href: '/blog/how-to-stop-bot-signups-without-captcha' },
    ],
  },
  {
    term: 'Pay-per-call pricing',
    slug: 'pay-per-call-pricing',
    definition:
      'Pay-per-call pricing (also: usage-based pricing, metered billing) is a billing model where the customer pays only for the API calls they make — no monthly minimum, no subscription, no contract. Common for fraud-detection APIs (SignupDoggy, IPQualityScore\'s volume tier), SMS APIs (Twilio), and email APIs (Postmark). The opposite is seat-based pricing (Salesforce, HubSpot). Pay-per-call favors small teams and indie hackers because there\'s no committed spend.',
    example: 'SignupDoggy charges $0.01 per /v1/check call. Buy 1,000 credits for $5 once; use them whenever.',
    relatedLinks: [
      { label: 'Pricing', href: '/pricing' },
      { label: 'The 7 best fraud detection APIs for indie hackers', href: '/blog/best-fraud-detection-apis-indie-hackers-2026' },
    ],
  },
  {
    term: 'E-E-A-T',
    slug: 'eeat',
    definition:
      'E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) is Google\'s framework for evaluating content quality. Updated from E-A-T in late 2022 with the addition of "Experience" (first-hand, lived experience with the topic). High E-E-A-T signals include an author bio with verifiable credentials, links to authoritative external sources, contact information, and content that demonstrates actual use of the product or service described. Not a direct ranking factor but a strong correlation with positions.',
    example: 'A post by "Dr. Linus Torvalds, Linux kernel maintainer since 1991" about kernel internals carries more weight than an anonymous post on the same topic.',
    relatedLinks: [
      { label: 'About the author', href: '/author/jeffrin-james' },
    ],
  },
];

export default function Glossary() {
  return (
    <AppLayout>
      <SEO config={SEO_ROUTES.glossary} />
      <div className="page-content">
        <div className="term-banner">
          <span className="banner-prompt">$</span> ./glossary --list
          <span className="banner-status">● {TERMS.length} TERMS</span>
        </div>

        <header style={{ marginBottom: 'var(--space-2xl)' }}>
          <h1 className="docs-h1" style={{ marginTop: 'var(--space-md)' }}>Signup Quality Glossary</h1>
          <p className="docs-lead">
            Every term you need to understand signup validation, fraud detection, and email-risk
            scoring. Plain-English definitions with examples and links to deeper reading.
          </p>
        </header>

        <nav aria-label="Glossary contents" style={{ marginBottom: 'var(--space-2xl)', padding: 'var(--space-lg)', background: 'var(--bg-elevated, rgba(255,255,255,0.03))', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-faint)' }}>
          <strong>Jump to:</strong>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: 'var(--space-sm)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
            {TERMS.map((t) => (
              <li key={t.slug}>
                <a href={`#${t.slug}`} style={{ fontSize: '0.9em' }}>{t.term}</a>
              </li>
            ))}
          </ul>
        </nav>

        {TERMS.map((t) => (
          <section key={t.slug} id={t.slug} style={{ marginBottom: 'var(--space-2xl)', scrollMarginTop: 'var(--space-xl)' }}>
            <h2 className="docs-h2">{t.term}</h2>
            <p className="docs-p">{t.definition}</p>
            {t.example && (
              <p className="docs-p" style={{ background: 'var(--bg-elevated, rgba(255,255,255,0.03))', padding: 'var(--space-md)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-faint)' }}>
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.85em', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Example:</strong>
                <br />
                <code style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.95em' }}>{t.example}</code>
              </p>
            )}
            <p className="docs-p" style={{ fontSize: '0.9em' }}>
              <strong>Read more:</strong>{' '}
              {t.relatedLinks.map((l, i) => (
                <span key={l.href}>
                  {i > 0 && ' · '}
                  <Link to={l.href}>{l.label}</Link>
                </span>
              ))}
            </p>
          </section>
        ))}

        <section style={{ marginTop: 'var(--space-3xl)', padding: 'var(--space-xl) 0', borderTop: '1px solid var(--border-faint)' }}>
          <h2 className="docs-h2">See it in action</h2>
          <p className="docs-p">
            Every term above maps to a real signal in the SignupDoggy API. Try the live demo
            or read the API reference to see how they fit together.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)', flexWrap: 'wrap' }}>
            <a className="cta-button" href="/disposable-checker">Try the free email checker</a>
            <a className="cta-button secondary" href="/docs">Read the API reference</a>
            <a className="cta-button secondary" href="/topics">Browse all topics</a>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}