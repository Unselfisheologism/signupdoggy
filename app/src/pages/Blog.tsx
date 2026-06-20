import { useMemo, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { posts, type PostMeta } from '../lib/posts';
import { SEO } from '../components/SEO';
import { ROUTES as SEO_ROUTES } from '../lib/seoConfig';

// /blog — the index page with live client-side search.
//
// Supports `?q=<query>` URL parameter for the SearchAction target declared
// in the homepage WebSite schema. We pull the query from the URL on mount
// and re-filter when the user types in the search box (which also updates
// the URL via setSearchParams, so the search is shareable + bookmarkable).

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);

  // When the URL query changes (back/forward button), sync local state.
  useEffect(() => {
    const urlQ = searchParams.get('q') || '';
    if (urlQ !== query) setQuery(urlQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Filter posts: case-insensitive substring match against title, description,
  // and tags. Sorted by recency (most recent first — same order as posts.ts).
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    const terms = q.split(/\s+/).filter(Boolean);
    return posts.filter((p) => {
      const haystack = [
        p.title.toLowerCase(),
        p.description.toLowerCase(),
        ...(p.tags || []).map((t) => t.toLowerCase()),
      ].join(' ');
      return terms.every((t) => haystack.includes(t));
    });
  }, [query]);

  function handleQueryChange(value: string) {
    setQuery(value);
    // Update the URL so the search is shareable. Use replace so we don't
    // pollute browser history with every keystroke.
    if (value.trim()) {
      setSearchParams({ q: value }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }

  function clearSearch() {
    setQuery('');
    setSearchParams({}, { replace: true });
  }

  return (
    <AppLayout>
      <SEO config={SEO_ROUTES.blog} />
      <div className="page-content">
        <div className="term-banner">
          <span className="banner-prompt">$</span> {query ? `./blog --search="${query}"` : './blog --list'}
          <span className="banner-status">
            ● {results.length} {results.length === 1 ? 'POST' : 'POSTS'}
            {query && results.length !== posts.length && ` / ${posts.length}`}
          </span>
        </div>

        <h1 className="docs-h1">BLOG</h1>
        <p className="docs-lead">
          LONG-FORM NOTES ON SIGNUP QUALITY, USER VALIDATION, AND THE
          INDIECHAUNING OF ANTI-FRAUD INFRASTRUCTURE. BY JEFFRIN JAMES, FOUNDER.
        </p>

        {/* Search box — updates URL on every keystroke. The SearchAction
            schema in the homepage SEO config points here with ?q={search_term_string}. */}
        <div className="blog-search">
          <span className="blog-search-prompt">$</span>
          <input
            type="search"
            className="blog-search-input"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="grep for: disposable email, fraud API, tor exit, captcha..."
            aria-label="Search blog posts by title, description, or tags"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              type="button"
              className="blog-search-clear"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {query && (
          <p className="blog-search-meta">
            {results.length === 0 ? (
              <>
                No posts match <code>"{query}"</code>. Try one of the chips below.
              </>
            ) : results.length === 1 ? (
              <>
                1 result for <code>"{query}"</code>.
              </>
            ) : (
              <>
                {results.length} results for <code>"{query}"</code>, newest first.
              </>
            )}
          </p>
        )}

        {results.length === 0 ? (
          <div className="blog-empty">
            <span className="blog-empty-icon">◇</span>
            <span className="blog-empty-text">
              NO POSTS MATCH YOUR SEARCH. TRY A BROADER QUERY.
            </span>
          </div>
        ) : (
          <ul className="blog-list">
            {results.map((post) => (
              <BlogCard key={post.slug} post={post} highlight={query} />
            ))}
          </ul>
        )}

        <p className="docs-p" style={{ marginTop: 'var(--space-xl)', opacity: 0.65 }}>
          {query
            ? 'Tip: search runs against post title, description, and tags. Press × to clear.'
            : posts.length === 1
              ? 'More posts coming. The blog updates as we ship — same place every time.'
              : `${posts.length} posts so far. The blog updates as we ship — same place every time.`}
        </p>
      </div>
    </AppLayout>
  );
}

// Per-post card with optional query highlighting in title + description.
function BlogCard({ post, highlight }: { post: PostMeta; highlight: string }) {
  const q = highlight.trim().toLowerCase();
  return (
    <li className="blog-card-wrap">
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