import { Link, useParams, Navigate } from 'react-router-dom';
import { useMemo } from 'react';
import { marked } from 'marked';
import AppLayout from '../components/AppLayout';
import { getPostBySlug, posts as allPosts } from '../lib/posts';
import { POST_BODIES } from '../lib/postContent';
import { SEO } from '../components/SEO';
import type { SeoConfig } from '../lib/seoConfig';
import { SITE } from '../lib/seoConfig';

// /blog/:slug — single post page.
//
// Post body is loaded from src/lib/postContent.ts (a plain TS string
// constant keyed by slug). It's parsed with `marked` and rendered via
// `dangerouslySetInnerHTML`. The content is hand-authored, not
// user-submitted, so innerHTML is safe here.
//
// SEO features baked in:
// - BlogPosting + BreadcrumbList JSON-LD (every post)
// - FAQPage JSON-LD when the markdown body has a "## FAQ" section
//   (Google rich-snippet eligible — gets FAQ dropdowns in SERP)
// - HowTo JSON-LD for tutorial posts (tagged "Tutorial" or "Node.js")
// - "Related posts" footer with 3 internal cross-links to other posts
//   (distributes page authority, helps with site-wide indexing)

type FaqItem = { question: string; answer: string };
type HowToStep = { name: string; text: string };

function extractFaq(markdown: string): FaqItem[] {
  // Parse the "## FAQ" section. Format in every post:
  //   ## FAQ
  //   **Q: question?**
  //   A: answer.
  //   **Q: question?**
  //   A: answer.
  const faqMatch = markdown.match(/##\s+FAQ\s*\n([\s\S]*?)(?=\n##\s|\n---\s*$|$)/m);
  if (!faqMatch) return [];
  const block = faqMatch[1];
  const items: FaqItem[] = [];
  // Match **Q: ...?** followed by A: ... (until next Q: or end)
  const qaRe = /\*\*Q:\s*([^*?]+?)\?\*\*\s*\n\s*A:\s*([\s\S]*?)(?=\n\s*\*\*Q:|\s*$)/g;
  let m;
  while ((m = qaRe.exec(block)) !== null) {
    const question = m[1].trim() + '?';
    const answer = m[2].trim().replace(/\n+/g, ' ');
    if (question.length > 5 && answer.length > 10) {
      items.push({ question, answer });
    }
  }
  return items;
}

function extractHowToSteps(markdown: string, title: string): HowToStep[] | null {
  // Detect tutorial posts: have a "## Step 1" or "## 1." or have
  // tags including "Tutorial" or "Node.js". Returns the first
  // numbered/bulleted run as HowTo steps.
  if (!/##\s+(Step|step|[0-9]\.)/m.test(markdown)) return null;
  const steps: HowToStep[] = [];
  // Match `### N. Title` followed by paragraph(s)
  const stepRe = /###\s+(\d+)\.\s+([^\n]+)\n+([\s\S]*?)(?=\n###\s+\d+\.|\n##\s|$)/g;
  let m;
  while ((m = stepRe.exec(markdown)) !== null) {
    const name = m[2].trim();
    const text = m[3].trim().split('\n\n')[0].replace(/\n/g, ' ');
    if (name && text) {
      steps.push({ name, text: text.slice(0, 500) });
    }
  }
  return steps.length >= 2 ? steps : null;
}

function getPostSeo(slug: string, post: { title: string; description: string; date: string; tags: string[]; readingTime: string }): SeoConfig {
  const rawBody = POST_BODIES[slug] || '';
  const faqItems = extractFaq(rawBody);
  const howToSteps = extractHowToSteps(rawBody, post.title);
  const isTutorial = post.tags.some(t => /Tutorial|Node\.js|Supabase|Integration/i.test(t));

  const schemas: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.date,
      inLanguage: 'en-US',
      author: { '@type': 'Person', name: 'Jeffrin James', email: 'mailto:jeffrinjames99@gmail.com', url: `${SITE.url}/author/jeffrin-james`, jobTitle: 'Founder & Solo Developer', worksFor: { '@type': 'Organization', name: 'SignupDoggy', url: SITE.url } },
      publisher: { '@type': 'Organization', name: 'SignupDoggy', url: SITE.url, logo: { '@type': 'ImageObject', url: `${SITE.url}/android-chrome-512x512.png` } },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE.url}/blog/${slug}` },
      keywords: post.tags.join(', '),
      url: `${SITE.url}/blog/${slug}`,
      image: `${SITE.url}/og-image.png`,
      articleSection: post.tags[0] || 'Signup Quality',
      wordCount: Math.max(1, Math.round((rawBody.split(/\s+/).filter(Boolean).length))),
      timeRequired: post.readingTime,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/` },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE.url}/blog` },
        { '@type': 'ListItem', position: 3, name: post.title, item: `${SITE.url}/blog/${slug}` },
      ],
    },
  ];

  // FAQPage schema — Google rich-snippet eligible. Most blog posts have an FAQ section.
  if (faqItems.length >= 2) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map(f => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    });
  }

  // HowTo schema — Google rich-snippet eligible for tutorial posts.
  if (isTutorial && howToSteps) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: post.title,
      description: post.description,
      totalTime: post.readingTime,
      step: howToSteps.map((s, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: s.name,
        text: s.text,
      })),
    });
  }

  return {
    path: `/blog/${slug}`,
    title: `${post.title} — SignupDoggy Blog`,
    description: post.description,
    keywords: [...post.tags, 'signupdoggy', 'signup quality', 'fraud prevention', 'indie hacker'].join(', '),
    canonical: `${SITE.url}/blog/${slug}`,
    schemas,
  };
}

function RelatedPosts({ slugs }: { slugs: string[] }) {
  if (!slugs || slugs.length === 0) return null;
  const items = slugs
    .map(slug => {
      // Try blog post first
      const post = allPosts.find(p => p.slug === slug);
      if (post) return { slug, title: post.title, href: `/blog/${slug}`, kind: 'post' as const };
      // Try static page (use-cases, vs, integrations, etc.)
      if (slug === 'integrations') return { slug, title: 'Integrations — Supabase, Cloudflare Workers, Next.js', href: '/integrations', kind: 'page' as const };
      if (slug === 'changelog') return { slug, title: 'Changelog', href: '/changelog', kind: 'page' as const };
      if (slug.startsWith('use-cases/')) {
        const labels: Record<string, string> = {
          'use-cases/indie-hackers': 'Fraud detection for indie hackers',
          'use-cases/saas-startups': 'Fraud detection for SaaS startups',
          'use-cases/ecommerce': 'Fraud detection for e-commerce',
        };
        return { slug, title: labels[slug] || slug, href: `/${slug}`, kind: 'page' as const };
      }
      if (slug.startsWith('vs/')) {
        const labels: Record<string, string> = {
          'vs/ipqualityscore': 'IPQualityScore vs SignupDoggy',
          'vs/maxmind': 'MaxMind vs SignupDoggy',
          'vs/sift': 'Sift vs SignupDoggy',
          'vs/cloudflare-turnstile': 'Cloudflare Turnstile vs fraud API',
        };
        return { slug, title: labels[slug] || slug, href: `/${slug}`, kind: 'page' as const };
      }
      return null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .slice(0, 4);

  if (items.length === 0) return null;

  return (
    <section className="related-posts" style={{ marginTop: 'var(--space-3xl)', padding: 'var(--space-xl) 0', borderTop: '1px solid var(--border-faint)' }}>
      <h2 className="docs-h2" style={{ marginBottom: 'var(--space-md)' }}>Related reading</h2>
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 'var(--space-md)' }}>
        {items.map(item => (
          <li key={item.slug} style={{ padding: 'var(--space-md)', background: 'var(--bg-elevated, rgba(255,255,255,0.03))', border: '1px solid var(--border-faint)', borderRadius: '8px' }}>
            <Link to={item.href} style={{ display: 'block', textDecoration: 'none' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.title}</span>
              <span style={{ display: 'block', color: 'var(--text-muted, #888)', fontSize: '0.85em', marginTop: '4px' }}>
                {item.kind === 'post' ? 'Blog post' : 'Page'} →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  // Configure marked once. Options are stable; useMemo keeps the
  // renderer reference from being recreated on every render.
  const renderer = useMemo(() => {
    marked.setOptions({
      gfm: true,
      breaks: false,
    });
    return marked;
  }, []);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const raw = POST_BODIES[post.slug] ?? '';

  // Strip the leading H1 (the React header renders its own h1) and
  // the aeo:source HTML comment so the body lines up cleanly under
  // the hand-styled hero.
  const cleaned = raw
    .replace(/^#\s+.*\n+/, '')                    // drop the H1
    .replace(/^<!--\s*aeo:source=.*?-->\s*\n+/m, ''); // drop aeo:source

  const html = renderer.parse(cleaned) as string;

  return (
    <AppLayout>
      <SEO config={getPostSeo(post.slug, post)} />
      <div className="page-content">
        <div className="term-banner">
          <span className="banner-prompt">$</span> ./blog/{post.slug} --read
          <span className="banner-status">
            ● {post.readingTime.toUpperCase()} · {post.tags.join(' / ').toUpperCase()}
          </span>
        </div>

        {/* ═══ POST HEADER ═══ */}
        <header className="blog-post-header">
          <div className="blog-card-tags" style={{ marginBottom: 'var(--space-md)' }}>
            {post.tags.map((t) => (
              <span key={t} className="blog-tag">{t}</span>
            ))}
          </div>
          <h1 className="blog-post-title">{post.title}</h1>
          <p className="blog-post-desc">{post.description}</p>
          <div className="blog-post-meta">
            <span>
              <Link to="/author/jeffrin-james" style={{ color: 'inherit' }}>Jeffrin James</Link>
            </span>
            <span className="blog-dot">·</span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span className="blog-dot">·</span>
            <span className="blog-read-time">{post.readingTime} read</span>
          </div>
        </header>

        {/* ═══ POST BODY (rendered from markdown) ═══ */}
        <article
          className="blog-prose"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* ═══ RELATED POSTS (internal cross-linking for SEO) ═══ */}
        <RelatedPosts slugs={post.relatedSlugs || []} />

        {/* ═══ FOOTER NAV ═══ */}
        <footer className="blog-post-footer">
          <Link to="/blog" className="blog-back-link">
            ← All posts
          </Link>
          <span className="blog-dot">·</span>
          <a href="/">signupdoggy.pages.dev</a>
        </footer>
      </div>
    </AppLayout>
  );
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${months[m - 1]} ${d}, ${y}`;
}
