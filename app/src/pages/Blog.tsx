import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { posts } from '../lib/posts';
import { SEO } from '../components/SEO';
import { ROUTES as SEO_ROUTES } from '../lib/seoConfig';

// /blog — the index page.
//
// Lists every published post as a card. Each card links to the post page
// at /blog/<slug>. (The AEO markdown-twin pipeline at /blog/<slug>.md
// was removed when the dualmark system was deleted — see vite.config.ts
// notes. Crawlers can read the rendered post HTML just fine; for
// AI agents we expose the same content via /llms.txt and via the
// <noscript> body that prerender.mjs writes into each post's static
// index.html.)

export default function Blog() {
  return (
    <AppLayout>
      <SEO config={SEO_ROUTES.blog} />
      <div className="page-content">
        <div className="term-banner">
          <span className="banner-prompt">$</span> ./blog --list
          <span className="banner-status">● {posts.length} {posts.length === 1 ? 'POST' : 'POSTS'}</span>
        </div>

        <h1 className="docs-h1">BLOG</h1>
        <p className="docs-lead">
          LONG-FORM NOTES ON SIGNUP QUALITY, USER VALIDATION, AND THE
          INDIECHAUNING OF ANTI-FRAUD INFRASTRUCTURE. BY JEFFRIN JAMES, FOUNDER.
        </p>

        <ul className="blog-list">
          {posts.map((post) => (
            <li key={post.slug} className="blog-card-wrap">
              <Link to={`/blog/${post.slug}`} className="blog-card">
                <div className="blog-card-tags">
                  {post.featured && <span className="blog-tag blog-tag--featured">Latest</span>}
                  {post.tags.map((t) => (
                    <span key={t} className="blog-tag">{t}</span>
                  ))}
                </div>
                <h2 className="blog-card-title">{post.title}</h2>
                <p className="blog-card-desc">{post.description}</p>
                <div className="blog-card-meta">
                  <span>{formatDate(post.date)}</span>
                  <span className="blog-dot">·</span>
                  <span>Jeffrin James</span>
                  <span className="blog-dot">·</span>
                  <span className="blog-read-time">{post.readingTime} read</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <p className="docs-p" style={{ marginTop: 'var(--space-xl)', opacity: 0.65 }}>
          {posts.length === 1
            ? 'More posts coming. The blog updates as we ship — same place every time.'
            : `${posts.length} posts so far. The blog updates as we ship — same place every time.`}
        </p>
      </div>
    </AppLayout>
  );
}

function formatDate(iso: string): string {
  // Avoid locale-dependent toLocaleDateString so the server-rendered HTML
  // (if any) and the client render match. The blog post is intentionally
  // English-only at the moment.
  const [y, m, d] = iso.split('-').map(Number);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${months[m - 1]} ${d}, ${y}`;
}
