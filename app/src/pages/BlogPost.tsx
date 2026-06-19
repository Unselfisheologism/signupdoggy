import { Link, useParams, Navigate } from 'react-router-dom';
import { useMemo } from 'react';
import { marked } from 'marked';
import AppLayout from '../components/AppLayout';
import { getPostBySlug } from '../lib/posts';

// Vite `?raw` glob — every markdown file in the blog folder, keyed by
// relative path. The same .md files are served to AI agents by the
// AEO Worker as the markdown twin at /blog/<slug>.md, so there is
// literally one source of truth for the body content.
//
// We use `import.meta.glob` (Vite's recommended pattern) instead of
// static `import` because the static form hit a Rollup limitation
// around resolving .md files outside the conventional src tree.
// `as: 'raw'` reads each file as a string at build time.
// `eager: true` resolves them inline so we don't need a Suspense boundary.
const POST_BODIES = import.meta.glob('../aeo/content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

// /blog/:slug — single post page.
//
// Imports the same .md file that the AEO Worker serves as the
// markdown twin to AI agents. That makes the React render and the
// AI-readable markdown literally the same source — no drift.
//
// The body is parsed once with `marked` and injected via
// `dangerouslySetInnerHTML`. The content is hand-authored (we own
// app/aeo/content/blog/<slug>.md), not user-submitted, so this is
// a safe use of innerHTML.

// Map glob keys ("../aeo/content/blog/<slug>.md") to slugs.
function bodyFor(slug: string): string {
  const key = `../aeo/content/blog/${slug}.md`;
  return POST_BODIES[key] ?? '';
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  // Configure marked once per render. The options are stable, so
  // wrapping in useMemo keeps the renderer from being recreated.
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

  const raw = bodyFor(post.slug);

  // Strip the leading H1 (we render the title in the React header)
  // and the aeo:source HTML comment, so the markdown body lines up
  // cleanly under our hand-styled hero.
  const cleaned = raw
    .replace(/^#\s+.*\n+/, '')                    // drop the H1
    .replace(/^<!--\s*aeo:source=.*?-->\s*\n+/m, ''); // drop aeo:source

  const html = renderer.parse(cleaned) as string;

  return (
    <AppLayout>
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
            <span>Jeffrin James</span>
            <span className="blog-dot">·</span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span className="blog-dot">·</span>
            <span className="blog-read-time">{post.readingTime} read</span>
            <span className="blog-dot">·</span>
            <a
              href={`/blog/${post.slug}.md`}
              title="The same post as plain markdown — what AI agents see"
            >
              .md
            </a>
          </div>
        </header>

        {/* ═══ POST BODY (rendered from markdown) ═══ */}
        <article
          className="blog-prose"
          dangerouslySetInnerHTML={{ __html: html }}
        />

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

