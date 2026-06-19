import { Link, useParams, Navigate } from 'react-router-dom';
import { useMemo } from 'react';
import { marked } from 'marked';
import AppLayout from '../components/AppLayout';
import { getPostBySlug } from '../lib/posts';
import { POST_BODIES } from '../lib/postContent';

// /blog/:slug — single post page.
//
// Post body is loaded from src/lib/postContent.ts (a plain TS string
// constant keyed by slug). It's parsed with `marked` and rendered via
// `dangerouslySetInnerHTML`. The content is hand-authored, not
// user-submitted, so innerHTML is safe here.
//
// To add a post:
//   1. Add a markdown body string to POST_BODIES in postContent.ts.
//   2. Add a matching entry in src/lib/posts.ts (slug, title, etc.).

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
