// Generic static-page component for comparison pages, use-case pages,
// and integrations pages. Renders markdown-like content using the
// existing docs/blog CSS classes so the new pages match the design
// language of the rest of the site.

import { useMemo } from 'react';
import { marked } from 'marked';
import AppLayout from '../components/AppLayout';
import { SEO } from '../components/SEO';
import type { SeoConfig } from '../lib/seoConfig';

interface StaticPageProps {
  config: SeoConfig;
  body: string;
  bannerCmd: string;
  bannerStatus: string;
}

export default function StaticPage({ config, body, bannerCmd, bannerStatus }: StaticPageProps) {
  const renderer = useMemo(() => {
    marked.setOptions({ gfm: true, breaks: false });
    return marked;
  }, []);

  // Strip the leading H1 if present (we render our own h1).
  const cleaned = body.replace(/^#\s+.*\n+/, '');
  const html = renderer.parse(cleaned) as string;

  return (
    <AppLayout>
      <SEO config={config} />
      <div className="page-content">
        <div className="term-banner">
          <span className="banner-prompt">$</span> {bannerCmd}
          <span className="banner-status">
            ● {bannerStatus}
          </span>
        </div>

        {/* ═══ PAGE HEADER ═══ */}
        <header style={{ marginBottom: 'var(--space-2xl)' }}>
          <h1 className="docs-h1" style={{ marginTop: 'var(--space-md)' }}>{config.title}</h1>
          <p className="docs-lead">{config.description}</p>
        </header>

        {/* ═══ PAGE BODY ═══ */}
        <article
          className="blog-post-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* ═══ CTA ═══ */}
        <section style={{ marginTop: 'var(--space-3xl)', padding: 'var(--space-xl) 0', borderTop: '1px solid var(--border-faint)' }}>
          <h2 className="docs-h2">Try it now</h2>
          <p className="docs-p">
            Spin up a free API key in under a minute. Or try the live demo in your browser
            with no signup required.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)', flexWrap: 'wrap' }}>
            <a className="cta-button" href="/signup" rel="nofollow">Get a free API key</a>
            <a className="cta-button secondary" href="/docs">Read the API docs</a>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
