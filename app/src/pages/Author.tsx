// Author profile page (/author/:slug) — E-E-A-T signal.
//
// Google uses author pages to evaluate the credibility of content
// (the "E" in E-E-A-T: Experience, Expertise, Authoritativeness,
// Trustworthiness). A real author page with bio, credentials, and
// links to all their posts gives the blog posts a stronger signal.
//
// Right now we have one author: Jeffrin James. The slug is hardcoded
// in the route. If we add a second author later, we'd refactor this
// to read from a `authors.ts` registry.

import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { SEO } from '../components/SEO';
import { posts as allPosts } from '../lib/posts';
import { SITE } from '../lib/seoConfig';

const config = {
  path: '/author/jeffrin-james',
  title: 'Jeffrin James — Founder of SignupDoggy',
  description: 'Jeffrin James is the founder of SignupDoggy, a serverless fraud-detection API for indie hackers and small SaaS teams. Six years building fraud-detection systems, one-person operation, Mumbai India.',
  keywords: 'Jeffrin James, SignupDoggy founder, fraud detection engineer, indie hacker, Mumbai India',
  canonical: 'https://signupdoggy.pages.dev/author/jeffrin-james',
  schemas: [
    {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      mainEntity: {
        '@type': 'Person',
        name: 'Jeffrin James',
        alternateName: 'jeffrinjames99',
        jobTitle: 'Founder & Solo Developer',
        description: 'Founder of SignupDoggy. Six years building fraud-detection systems. One-person operation based in Mumbai, India.',
        url: 'https://signupdoggy.pages.dev/author/jeffrin-james',
        email: 'mailto:jeffrinjames99@gmail.com',
        sameAs: [
          'https://twitter.com/signupdoggy',
        ],
        knowsAbout: [
          'Fraud detection',
          'Disposable email detection',
          'VPN and Tor detection',
          'SaaS signup flows',
          'Indie SaaS',
          'Cloudflare Workers',
        ],
        worksFor: {
          '@type': 'Organization',
          name: 'SignupDoggy',
          url: 'https://signupdoggy.pages.dev',
          founder: { '@type': 'Person', name: 'Jeffrin James' },
        },
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
};

export default function AuthorPage() {
  return (
    <AppLayout>
      <SEO config={config} />
      <div className="page-content">
        <div className="term-banner">
          <span className="banner-prompt">$</span> ./author --jeffrin-james
          <span className="banner-status">● E-E-A-T</span>
        </div>

        <header style={{ marginBottom: 'var(--space-2xl)' }}>
          <h1 className="docs-h1" style={{ marginTop: 'var(--space-md)' }}>Jeffrin James</h1>
          <p className="docs-lead">Founder of SignupDoggy. Six years building fraud-detection systems. One-person operation based in Mumbai, India.</p>
        </header>

        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <h2 className="docs-h2"># Background</h2>
          <p className="docs-p">
            Jeffrin James is a software engineer and founder of <Link to="/">SignupDoggy</Link>, a serverless fraud-detection API for indie hackers and small SaaS teams.
            He built the product in Mumbai, India, after spending six months and $2,400 on enterprise fraud-detection vendors that didn't fit his use case.
          </p>
          <p className="docs-p">
            Before SignupDoggy, Jeffrin built fraud-detection systems for two bootstrapped SaaS companies and a marketplace platform. He runs SignupDoggy as a one-person operation
            and answers support emails himself, usually within a day.
          </p>
        </section>

        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <h2 className="docs-h2"># Expertise</h2>
          <ul className="docs-p">
            <li>Fraud detection (signup-quality scoring, account-takeover, payment fraud)</li>
            <li>Disposable email detection and blocklist maintenance</li>
            <li>VPN, Tor, and residential-proxy detection</li>
            <li>SaaS signup-flow design and conversion optimization</li>
            <li>Cloudflare Workers, KV, and edge computing</li>
            <li>Indie SaaS, pay-per-call pricing models, and the indie-hacker community</li>
          </ul>
        </section>

        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <h2 className="docs-h2"># Credentials &amp; experience</h2>
          <p className="docs-p">
            6+ years building fraud-detection systems for SaaS and marketplace platforms.
            Built and maintains SignupDoggy's 200,000+ domain disposable-email blocklist, synced daily from 5 public GitHub repos,
            1 bulk API, and 175 per-provider crawls. Maintains a 70,000+ Tor exit node list and a 24,000+ VPN / hosting ASN list.
          </p>
          <p className="docs-p">
            Open-source contributor to: <a href="https://github.com/disposable-email-domains/disposable-email-domains" target="_blank" rel="noopener noreferrer">disposable-email-domains</a> (community-maintained blocklist).
          </p>
        </section>

        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <h2 className="docs-h2"># Posts by Jeffrin ({allPosts.length})</h2>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 'var(--space-md)' }}>
            {allPosts.map(p => (
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

        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <h2 className="docs-h2"># Contact</h2>
          <p className="docs-p">
            Email: <a href="mailto:jeffrinjames99@gmail.com">jeffrinjames99@gmail.com</a> (responds within a day)<br/>
            Alt: <a href="mailto:jeff9james@protonmail.com">jeff9james@protonmail.com</a><br/>
            Site: <a href={SITE.url}>{SITE.url.replace('https://', '')}</a>
          </p>
        </section>
      </div>
    </AppLayout>
  );
}
