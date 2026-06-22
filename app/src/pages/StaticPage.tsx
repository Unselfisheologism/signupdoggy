// Generic static-page component for comparison pages, use-case pages,
// and integrations pages. Renders markdown-like content using the
// existing docs/blog CSS classes so the new pages match the design
// language of the rest of the site.
//
// The body strings (COMPARE_BODIES / USE_CASE_BODIES / INTEGRATIONS_BODY /
// CHANGELOG_BODY) used to be imported at the App.tsx top level so each
// Route could pass them as a prop. That pulled the entire 21 KB body
// payload into the main bundle even though StaticPage is lazy-loaded
// and only ever renders on routes that need one of those bodies.
// We now look the body up internally by config.path so the strings
// live in the StaticPage chunk (loaded only when a user actually visits
// /vs/* / /use-cases/* / /integrations / /changelog).

import { useMemo } from 'react';
import { marked } from 'marked';
import AppLayout from '../components/AppLayout';
import { SEO } from '../components/SEO';
import type { SeoConfig } from '../lib/seoConfig';
import {
  COMPARE_BODIES,
  USE_CASE_BODIES,
  INTEGRATIONS_BODY,
  CHANGELOG_BODY,
} from '../lib/staticBodies';

interface StaticPageProps {
  config: SeoConfig;
  body?: string; // optional — overrides the internal lookup if supplied
  bannerCmd: string;
  bannerStatus: string;
}

function resolveBody(configPath: string, override?: string): string {
  if (override) return override;
  if (configPath.startsWith('/vs/')) return COMPARE_BODIES[configPath] || '';
  if (configPath.startsWith('/use-cases/')) return USE_CASE_BODIES[configPath] || '';
  if (configPath === '/integrations') return INTEGRATIONS_BODY;
  if (configPath === '/changelog') return CHANGELOG_BODY;
  return '';
}

export default function StaticPage({ config, body, bannerCmd, bannerStatus }: StaticPageProps) {
  const renderer = useMemo(() => {
    marked.setOptions({ gfm: true, breaks: false });
    return marked;
  }, []);

  // Strip the leading H1 if present (we render our own h1).
  const cleaned = resolveBody(config.path, body).replace(/^#\s+.*\n+/, '');
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
