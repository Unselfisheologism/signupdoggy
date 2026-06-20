// Topics hub page (/topics) — pillar content pattern.
//
// Groups all blog posts by topic so a single page can rank for
// broad topic queries ("disposable email detection" → /topics/
// disposable-email-detection). Distributes page authority from
// the hub to the deep posts via internal links.
//
// This is the same pattern Wirecutter, NerdWallet, and other
// top-SEO publishers use: one big page per topic, with links to
// every long-form post on that topic.

import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { SEO } from '../components/SEO';
import { posts as allPosts } from '../lib/posts';
import { SITE } from '../lib/seoConfig';

const config = {
  path: '/topics',
  title: 'Topics — SignupDoggy Blog',
  description: 'All SignupDoggy blog posts grouped by topic: disposable email detection, VPN/Tor detection, fraud API comparisons, signup form optimization, and more.',
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
};

const TOPIC_GROUPS: { topic: string; slug: string; description: string; tags: string[] }[] = [
  {
    topic: 'Disposable email detection',
    slug: 'disposable-email-detection',
    description: 'How to detect, block, and maintain a disposable-email blocklist. API comparisons, tutorials, and code.',
    tags: ['Disposable email', 'API', 'Tutorial', 'Engineering'],
  },
  {
    topic: 'VPN, Tor, and proxy detection',
    slug: 'vpn-tor-detection',
    description: 'How to detect VPN, Tor, and residential-proxy users at signup. The signal-stacking approach.',
    tags: ['VPN detection', 'Tor', 'Tutorial'],
  },
  {
    topic: 'Fraud API comparisons',
    slug: 'fraud-api-comparisons',
    description: 'Side-by-side comparisons of fraud-detection APIs. IPQualityScore, MaxMind, Sift, Cloudflare Turnstile.',
    tags: ['IPQualityScore', 'MaxMind', 'Sift', 'Comparison'],
  },
  {
    topic: 'Signup form optimization',
    slug: 'signup-form-optimization',
    description: 'Conversion-killing anti-patterns in signup forms, and the fixes that keep real users while blocking bots.',
    tags: ['SaaS', 'Conversion', 'UX', 'Signup form'],
  },
  {
    topic: 'Bot detection and CAPTCHA alternatives',
    slug: 'bot-detection',
    description: 'CAPTCHA alternatives and 2-stage funnel patterns for catching bot signups without losing real users.',
    tags: ['Bot detection', 'CAPTCHA', 'Signup fraud'],
  },
  {
    topic: 'Indie SaaS and fraud prevention',
    slug: 'indie-saas',
    description: 'Fraud prevention for indie hackers and bootstrapped SaaS teams. Pay-per-call pricing, self-service setup, no sales calls.',
    tags: ['Indie hackers', 'SaaS', 'Pricing'],
  },
  {
    topic: 'Supabase, Cloudflare Workers, integrations',
    slug: 'integrations',
    description: 'Integrating SignupDoggy with Supabase Auth, Cloudflare Workers, Next.js, Node, Python, Django.',
    tags: ['Supabase', 'Tutorial', 'Integration', 'Auth'],
  },
];

export default function Topics() {
  return (
    <AppLayout>
      <SEO config={config} />
      <div className="page-content">
        <div className="term-banner">
          <span className="banner-prompt">$</span> ./topics --list
          <span className="banner-status">● {allPosts.length} POSTS</span>
        </div>

        <header style={{ marginBottom: 'var(--space-2xl)' }}>
          <h1 className="docs-h1" style={{ marginTop: 'var(--space-md)' }}>Topics</h1>
          <p className="docs-lead">All SignupDoggy blog posts grouped by topic. Pick a topic to see all related posts.</p>
        </header>

        {TOPIC_GROUPS.map(group => {
          const groupPosts = allPosts.filter(p => p.tags.some(t => group.tags.includes(t)));
          if (groupPosts.length === 0) return null;
          return (
            <section key={group.slug} style={{ marginBottom: 'var(--space-2xl)' }}>
              <h2 className="docs-h2"># {group.topic}</h2>
              <p className="docs-p">{group.description}</p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                {groupPosts.map(p => (
                  <li key={p.slug} style={{ padding: 'var(--space-md)', background: 'var(--bg-elevated, rgba(255,255,255,0.03))', border: '1px solid var(--border-faint)', borderRadius: '8px' }}>
                    <Link to={`/blog/${p.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.title}</span>
                      <span style={{ display: 'block', color: 'var(--text-muted, #888)', fontSize: '0.85em', marginTop: '4px' }}>
                        {p.readingTime} · {p.tags.join(' / ')}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <section style={{ marginTop: 'var(--space-3xl)' }}>
          <h2 className="docs-h2"># All posts</h2>
          <p className="docs-p">Or browse the full <Link to="/blog">/blog</Link> index.</p>
        </section>
      </div>
    </AppLayout>
  );
}
