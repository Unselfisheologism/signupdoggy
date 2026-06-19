import { Link, useParams, Navigate } from 'react-router-dom';
import { useMemo } from 'react';
import { marked } from 'marked';
import AppLayout from '../components/AppLayout';
import { getPostBySlug } from '../lib/posts';

// Vite plugin `md-inline-loader` (see vite.config.ts) turns each
// `?raw` import into an inlined JS string at build time. The same
// .md file is the source of truth for the AEO markdown twin served
// to AI agents at /blog/<slug>.md — so this render and the AI
// version literally share content. No dual-source drift.
//
// Add a new post:
//   1. Drop the .md at app/aeo/content/blog/<slug>.md.
//   2. Add the import below + a matching posts.ts entry.
//   3. Run aeo:build to refresh llms.txt + sitemap.
import howToValidateMarkdown from '../aeo/content/blog/how-to-validate-your-saas-idea-with-real-users.md?raw';

// /blog/:slug — single post page.
//
// The body is parsed with `marked` and injected via
// `dangerouslySetInnerHTML`. The content is hand-authored (we own
// the .md file), not user-submitted, so innerHTML is safe here.

// Map of slug → raw markdown body. Add an entry here (and a matching
// import above + posts.ts entry) when a new post lands.
const POST_BODIES: Record<string, string> = {
  'how-to-validate-your-saas-idea-with-real-users': howToValidateMarkdown,
};

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

  const raw = POST_BODIES[post.slug] ?? '';

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

