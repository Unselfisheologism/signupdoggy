// Blog post registry.
//
// Single source of truth for the list of posts rendered in:
//   - app/src/pages/Blog.tsx (React index page)
//   - app/src/aeo/llms-config.ts (the llms.txt AEO index)
//   - app/aeo/content/sitemap.md (the AI-facing sitemap)
//   - the home page footer (in the future, when more posts land)
//
// The actual post BODY is in app/aeo/content/blog/<slug>.md — that file
// is also the AEO markdown twin served to AI agents at /blog/<slug>.md.
// We import it with Vite's `?raw` so the React post page renders the
// same content humans read in the .md file, with no duplication.
//
// To add a new post:
//   1. Drop a markdown file at app/aeo/content/blog/<slug>.md.
//   2. Add an entry below with matching slug.
//   3. Update app/aeo/llms-config.ts to advertise it.
//   4. Update app/aeo/content/sitemap.md to list it.
//   5. Update app/aeo/build-content.ts sitemap entries if priority matters.
//   6. Run `npm run aeo:verify` to confirm AEO conformance.

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  /** ISO date string (YYYY-MM-DD). */
  date: string;
  /** Pre-computed reading time for display (e.g. "9 min"). */
  readingTime: string;
  /** Visible tag chips on the card. */
  tags: string[];
  /** True for the most recent post — gets a "Latest" badge. */
  featured?: boolean;
}

export const posts: PostMeta[] = [
  {
    slug: 'how-to-validate-your-saas-idea-with-real-users',
    title:
      'How SaaS founders should actually get user validation (and why most advice is wrong)',
    description:
      'Most "validate your SaaS idea" advice tells you to get more signups. That\u2019s the worst thing you can do. A 5-step playbook for validating with buyers, not free users.',
    date: '2026-06-19',
    readingTime: '9 min',
    tags: ['SaaS', 'Validation', 'Indie hackers'],
    featured: true,
  },
];

export function getPostBySlug(slug: string): PostMeta | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getLatestPost(): PostMeta | undefined {
  return posts[0]; // posts are ordered newest-first; flip if you reorder
}
