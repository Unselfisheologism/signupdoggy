# Google Search Central — Gap Analysis Checklist

> **Site:** `https://signupdoggy.pages.dev`
> **Scope:** Single-page React/Vite SPA, prerendered to static HTML, deployed on Cloudflare Pages.
> **Stack:** Vite + React + TypeScript · `app/src/lib/seoConfig.ts` (per-route meta + JSON-LD) · `app/scripts/prerender.mjs` (build-time HTML emission) · `app/public/sitemap.xml` · `app/public/robots.txt`.
> **Verdict legend:** ✅ DONE · ⚠️ PARTIAL · ❌ MISSING · N/A (not applicable)
> **Source:** `https://developers.google.com/search/docs/...` (every requirement links back to a specific doc page).
> **Generated:** 2026-06-20.
> **How to use this file:** Each block has a single concrete action (file path + line number) so a sub-agent can pick it up and ship the fix without re-reading source files.

---

## 1. Meta tags (Fundamentals)

### ✅ `<title>` is unique per page  |  Source: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Requirement: *"Make sure that every page on your site has a title specified in the `<title>` tag."* and *"Each page should have a unique title that describes its content."*
- Current state: Every entry in `app/src/lib/seoConfig.ts` (lines 62–871) sets a distinct `title`. The prerender script emits one `<title>` per route via `buildHead()` (`app/scripts/prerender.mjs:382`). The homepage title is 80 chars (slightly over Google's ~60-char display truncation, but within the 70-char warning zone — see Warning #1 below).
- Verdict: ✅ DONE.
- Action: Optional polish — trim the home title from `"SignupDoggy — Disposable Email, VPN & Tor Detection API · $0.01/call"` to ≤60 chars for cleaner SERP display. File: `app/src/lib/seoConfig.ts:65`.

### ✅ `<meta name="description">` is unique per page  |  Source: https://developers.google.com/search/docs/appearance/snippet
- Requirement: *"Each page should have a meta description that summarizes the page content. Search engines don't always use the meta description, but it's still a good practice."*
- Current state: Every `SeoConfig` entry sets a `description`. `prerender.mjs:383` emits `<meta name="description">` per route. Lengths are 130–170 chars — within Google's 150–160 sweet spot.
- Verdict: ✅ DONE.
- Action: None.

### ✅ `<meta name="robots">` with snippet / image-preview controls  |  Source: https://developers.google.com/search/docs/appearance/snippet
- Requirement: *"Use the `max-snippet`, `max-image-preview`, and `max-video-preview` robots meta tags to control how search results are displayed."*
- Current state: `prerender.mjs:376-378` emits:
  ```
  index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1
  ```
  for indexable pages and `noindex, nofollow` for `terms` and `privacy`. Both `robots` and `googlebot` are set.
- Verdict: ✅ DONE.
- Action: None.

### ⚠️ Missing `<meta name="viewport">` is set, but no `viewport-fit=cover`  |  Source: https://developers.google.com/search/docs/crawling-indexing/mobile
- Requirement: *"Use the meta viewport tag to control how your page is displayed on mobile devices."*
- Current state: `app/index.html:5` sets `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`. No `viewport-fit=cover` (only needed for PWA full-screen layouts — the manifest is `display: standalone`).
- Verdict: ⚠️ PARTIAL.
- Action: Add `viewport-fit=cover` to `app/index.html:5` for safer PWA standalone-mode behavior on notched iOS devices. Update `prerender.mjs` head template accordingly if you want it on every prerendered route.

### ⚠️ `<meta name="format-detection">` not set  |  Source: https://developers.google.com/search/docs/crawling-indexing/mobile
- Requirement: Apple's docs (referenced by Google's mobile guidance) recommend `<meta name="format-detection" content="telephone=no">` when phone numbers are decorative rather than click-to-call.
- Current state: Not present in `app/index.html` or in the prerender head template (`prerender.mjs:381-414`). Pages like `vs/onfido` may mention competitor phone numbers; Safari on iOS would auto-link them.
- Verdict: ⚠️ PARTIAL.
- Action: Add `<meta name="format-detection" content="telephone=no" />` to `prerender.mjs:381` (right after the theme-color line) and to `app/index.html:15` (SPA fallback). Page sections that genuinely want click-to-call can opt out per-region with `x-apple-data-detectors` (but we don't have any).

### ✅ `<meta charset="UTF-8" />` set  |  Source: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Requirement: Declaring a character set is a W3C requirement; absent it, some characters render as `?` boxes.
- Current state: `app/index.html:4` has `<meta charset="UTF-8" />`. Prerender copies it (`prerender.mjs:472` reads the shell HTML).
- Verdict: ✅ DONE.
- Action: None.

### ✅ `<meta name="theme-color">` and `<meta name="color-scheme">` set  |  Source: https://developer.chrome.com/docs/lighthouse/pwa/installable-manifest (referenced by Search Central's PWA docs)
- Requirement: For PWA / address-bar tinting on mobile, declare `theme-color`.
- Current state: `app/index.html:15` declares `<meta name="theme-color" content="#000000" />` and `app/index.html:16` declares `<meta name="color-scheme" content="dark" />`. Prerender injects theme-color on every route (`prerender.mjs:388`).
- Verdict: ✅ DONE.
- Action: None.

### ⚠️ `<html lang="en">` set, but no `xml:lang` (legacy IE) and no `dir` attribute  |  Source: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Requirement: *"Tell search engines the language of your content."*
- Current state: `app/index.html:2` uses `<html lang="en">`. Prerender preserves this in every route's shell.
- Verdict: ⚠️ PARTIAL.
- Action: Change to `<html lang="en-US">` to match the `inLanguage` declared in every JSON-LD schema (`seoConfig.ts` lines 97, 247, 332, etc.). Also add `dir="ltr"` for assistive-tech correctness. Both go in `app/index.html:2` and the prerender must preserve them on every output (`prerender.mjs:472` reads the shell, so this happens automatically as long as the source `<html>` tag is correct).

---

## 2. Open Graph + Twitter Cards

### ✅ `og:title`, `og:description`, `og:url`, `og:type`, `og:site_name`, `og:locale`  |  Source: https://developers.google.com/search/docs/appearance/structured-data/open-graph
- Requirement: Open Graph protocol basics — title, description, URL, type, site_name, locale are required.
- Current state: `prerender.mjs:397-402` and `SEO.tsx:91-96` emit all six on every route.
- Verdict: ✅ DONE.
- Action: None.

### ✅ `og:image` with `og:image:width`, `og:image:height`, `og:image:alt`  |  Source: https://developers.google.com/search/docs/appearance/structured-data/open-graph
- Requirement: Spec recommends explicit `width`/`height` (1200×630 ideal) and `alt`.
- Current state: `prerender.mjs:404-406` sets `1200 / 630 / <title>`. The default image lives at `https://signupdoggy.pages.dev/og-image.png` (verified in `app/public/og-image.png`).
- Verdict: ✅ DONE.
- Action: None.

### ⚠️ `og:image:secure_url` not set  |  Source: https://ogp.me/#structured
- Requirement: Recommended for HTTPS sites; lets Facebook/LinkedIn pick the right scheme.
- Current state: Missing. The image is already served from an HTTPS origin (`https://signupdoggy.pages.dev/og-image.png`), so Facebook will auto-promote, but explicit is safer.
- Verdict: ⚠️ PARTIAL.
- Action: Add `<meta property="og:image:secure_url" content="..." />` immediately after `og:image` in `prerender.mjs:403` and `SEO.tsx:97`.

### ⚠️ `og:image:type` not set  |  Source: https://developers.google.com/search/docs/appearance/structured-data/open-graph
- Requirement: Recommended — tells the platform the MIME type without a HEAD request.
- Current state: Missing.
- Verdict: ⚠️ PARTIAL.
- Action: Add `<meta property="og:image:type" content="image/png" />` next to the other `og:image:*` lines in `prerender.mjs:404` and `SEO.tsx:98`.

### ❌ `article:published_time` and `article:modified_time` not set on blog posts  |  Source: https://developers.google.com/search/docs/appearance/structured-data/article
- Requirement: For `og:type=article`, the publisher-time and modified-time meta tags drive the article rich preview.
- Current state: `prerender.mjs:399` emits `og:type=article` for `/blog` and `/blog/*`, but no `article:published_time` / `article:modified_time` follow-up tags. The dates ARE in the BlogPosting JSON-LD (`prerender.mjs:278-279`) but not in the OG meta layer.
- Verdict: ❌ MISSING.
- Action: In `prerender.mjs` `buildHead()` (around line 399), when `config.path` starts with `/blog/`, add:
  ```html
  <meta property="article:published_time" content="${isoFromPostMeta}" />
  <meta property="article:modified_time" content="${isoFromPostMeta}" />
  <meta property="article:author" content="Jeffrin James" />
  <meta property="article:section" content="${post.tags[0]}" />
  ```
  Plumb the `posts` array into `buildHead()` and pick the entry by `path`.

### ✅ `og:type` correctly switches between `website` and `article`  |  Source: https://developers.google.com/search/docs/appearance/structured-data/article
- Requirement: `og:type=article` for blog content, `og:type=website` for everything else.
- Current state: `prerender.mjs:399` ternary emits `article` for `/blog` and `/blog/*`, `website` otherwise.
- Verdict: ✅ DONE.
- Action: None.

### ✅ Twitter Card `summary_large_image`  |  Source: https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards
- Requirement: Use `summary_large_image` for max 2:1 image; supply `twitter:title`, `twitter:description`, `twitter:image`, `twitter:site`, `twitter:image:alt`.
- Current state: `prerender.mjs:407-412` and `SEO.tsx:103-108` emit all six.
- Verdict: ✅ DONE.
- Action: None.

### ⚠️ `twitter:creator` not set  |  Source: https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup
- Requirement: Recommended — names the author of the content for byline.
- Current state: `twitter:site=@signupdoggy` is set but no per-author `twitter:creator`. The founder is `@jeffrinjames99` (inferred — not in code).
- Verdict: ⚠️ PARTIAL.
- Action: Add `<meta name="twitter:creator" content="@jeffrinjames99" />` to `prerender.mjs:412` and `SEO.tsx:108`. Only set it on the author page and blog posts; on the homepage keep `twitter:site` only.

---

## 3. Structured Data — Coverage Audit

### ✅ `Organization` schema on homepage  |  Source: https://developers.google.com/search/docs/appearance/structured-data/organization
- Requirement: Name, url, logo, sameAs, contactPoint. Logo must be ≥ 112×112 and on a stable URL.
- Current state: `seoConfig.ts:71-91` declares all required fields; logo is `https://signupdoggy.pages.dev/android-chrome-512x512.png` (512×512 — well above the 112×112 minimum). `sameAs` is `[]` — see Partial.
- Verdict: ⚠️ PARTIAL.
- Action: Populate `sameAs` in `seoConfig.ts:90` with real social URLs: `["https://twitter.com/signupdoggy", "https://github.com/jeffrinjames", "https://www.linkedin.com/in/jeffrinjames"]` (use whatever's real). Google uses `sameAs` to confirm entity identity across the web.

### ✅ `WebSite` schema with `SearchAction` (sitelinks search box)  |  Source: https://developers.google.com/search/docs/appearance/structured-data/sitelinks-searchbox
- Requirement: WebSite with `potentialAction` of type `SearchAction` and `target` template with `{search_term_string}`.
- Current state: `seoConfig.ts:92-103` declares the schema with target `https://signupdoggy.pages.dev/blog?q={search_term_string}`. The `/blog?q=` route is a real React route (visible in `Blog.tsx` / router config).
- Verdict: ✅ DONE.
- Action: Verify the `/blog?q=...` URL actually returns search results in the UI — if it 404s or shows an empty list, Google will silently drop the searchbox from SERPs. Test it now.

### ✅ `SoftwareApplication` schema on homepage with `AggregateOffer`  |  Source: https://developers.google.com/search/docs/appearance/structured-data/software-application
- Requirement: name, applicationCategory, operatingSystem, offers. For paid apps, use AggregateOffer with priceCurrency and lowPrice/highPrice.
- Current state: `seoConfig.ts:104-157` declares SoftwareApplication + AggregateOffer with 3 sub-Offers (Solo/Pro/Scale). All required fields present.
- Verdict: ✅ DONE.
- Action: None.

### ⚠️ `aggregateRating` is explicitly `undefined`  |  Source: https://developers.google.com/search/docs/appearance/structured-data/software-application
- Requirement: If you claim a rating, you MUST supply `aggregateRating` (reviewCount + ratingValue). If you don't have it, omit the field entirely — `undefined` will serialize to `"aggregateRating":null` in some JSON serializers, which Google treats as a soft violation.
- Current state: `seoConfig.ts:146` has `aggregateRating: undefined,` — this serializes to nothing (or `null` depending on `JSON.stringify` behavior). At least six testimonials exist in `Landing.tsx:362-400` but aren't captured as `Review` objects.
- Verdict: ⚠️ PARTIAL.
- Action: Either (a) delete the `aggregateRating: undefined` line (`seoConfig.ts:146`) so the schema omits the field cleanly, or (b) add a real `aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '6', bestRating: '5', worstRating: '1' }` and convert the testimonials in `Landing.tsx:363-399` to `Review` objects (see #21 below).

### ✅ `WebSite` `inLanguage` declared  |  Source: https://developers.google.com/search/docs/appearance/structured-data/article
- Requirement: For non-English sites, declare language. For single-language, it's still a good practice.
- Current state: `seoConfig.ts:97, 247, 332, 399, 430, 463, 498, ...` all set `inLanguage: 'en-US'`.
- Verdict: ✅ DONE.
- Action: None.

### ✅ `BreadcrumbList` on every multi-level route  |  Source: https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- Requirement: ListItem items with `@type`, `position` (1-indexed), `name`, `item` (full URL).
- Current state: Every ROUTES entry that has parents declares a BreadcrumbList (`seoConfig.ts:221-227, 265-272, 304-311, 333-340, ...` for 18 routes). BlogPost builds one at prerender time (`prerender.mjs:291-299`).
- Verdict: ✅ DONE.
- Action: None.

### ✅ `FAQPage` schema on homepage and DisposableChecker  |  Source: https://developers.google.com/search/docs/appearance/structured-data/faq
- Requirement: `mainEntity` array of `{ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } }`.
- Current state: `seoConfig.ts:158-218` (homepage, 7 Qs), `seoConfig.ts:755-799` (disposable-checker, 5 Qs). Blog posts auto-extract FAQ from `## FAQ` sections (`prerender.mjs:218-243, 302-312`).
- Verdict: ✅ DONE.
- Action: None.

### ✅ `Article` schema on /vs/* pages  |  Source: https://developers.google.com/search/docs/appearance/structured-data/article
- Requirement: For an article in non-news context, use `Article` (or `BlogPosting` for blog content). Required: `headline`, `datePublished`, `author`, `publisher`.
- Current state: `seoConfig.ts:391-413 (IPQS), 422-446 (MaxMind), 457-480 (Sift), 488-512 (Turnstile)` all declare Article with headline, datePublished, dateModified, author, publisher, mainEntityOfPage, url.
- Verdict: ✅ DONE.
- Action: None.

### ✅ `BlogPosting` schema on blog posts (auto-generated)  |  Source: https://developers.google.com/search/docs/appearance/structured-data/article
- Requirement: Same as Article but type is `BlogPosting`. Should include `image` (≥ 696×696 recommended), `publisher` with logo, `datePublished`/`dateModified`, `mainEntityOfPage`, `author`, `headline`, `description`, `articleBody` (optional but recommended).
- Current state: `prerender.mjs:272-300` generates BlogPosting per post. Has headline, description, datePublished, dateModified, author, publisher (with logo), mainEntityOfPage, keywords, url, image (defaults to `/og-image.png`), articleSection, wordCount, timeRequired.
- Verdict: ⚠️ PARTIAL — `articleBody` is missing.
- Action: In `prerender.mjs:288` add `articleBody: body.slice(0, 5000)` (the first 5 KB of the post body — Google uses this for snippet extraction when it doesn't want to re-crawl).

### ✅ `HowTo` schema on tutorial posts (auto-generated)  |  Source: https://developers.google.com/search/docs/appearance/structured-data/howto
- Requirement: `name`, `step` (array of HowToStep with position, name, text). Optional but recommended: `totalTime`, `description`, `tool`, `supply`.
- Current state: `prerender.mjs:245-264, 314-328` extracts steps from posts tagged Tutorial/Node.js/Supabase/Integration.
- Verdict: ✅ DONE.
- Action: None.

### ✅ `Product` schema on /pricing  |  Source: https://developers.google.com/search/docs/appearance/structured-data/product
- Requirement: For a sellable product, declare `Product` (not just Offer) with name, brand, offers, description.
- Current state: `seoConfig.ts:284-303` declares Product + AggregateOffer. The product isn't a physical good — but Product schema is still valid for SaaS pricing pages.
- Verdict: ✅ DONE.
- Action: None.

### ✅ `WebPage` schema on utility pages  |  Source: https://developers.google.com/search/docs/appearance/structured-data
- Requirement: Generic page; not always needed but doesn't hurt.
- Current state: `seoConfig.ts:351-361, 371-379, 523-540, 552-569, 580-597, 609-625, 637-653` declare WebPage on terms, privacy, use-cases, integrations, changelog.
- Verdict: ✅ DONE.
- Action: None.

### ✅ `CollectionPage` on /topics and /alternatives  |  Source: https://developers.google.com/search/docs/appearance/structured-data
- Requirement: When a page is a curated collection, CollectionPage signals that.
- Current state: `seoConfig.ts:701-708, 853-860` declare CollectionPage.
- Verdict: ✅ DONE.
- Action: Consider upgrading to `ItemList` — see #22 below.

### ⚠️ Missing `ItemList` for the /alternatives/<slug> sub-pages  |  Source: https://developers.google.com/search/docs/appearance/structured-data
- Requirement: For pages that are lists of comparable products, `ItemList` with `ListItem` entries helps Google understand the relation.
- Current state: `seoConfig.ts:alternatives` covers `/alternatives` (CollectionPage) but the 10 `/alternatives/<slug>` routes aren't in `seoConfig.ts` at all (they're rendered as static pages with no structured data). Confirmed in `app/dist/alternatives/<slug>/index.html` — files exist but no ItemList markup.
- Verdict: ❌ MISSING.
- Action: Add an `alternativesIpqualityscore`, `alternativesMaxmind`, etc. entry to `seoConfig.ts` (10 entries) with an `ItemList` schema listing the 3 closest competitors per page. Add the slugs to `prerender.mjs:500` route list (verify they're already there — they are, per `app/dist/alternatives/*/index.html` existing). Alternatively, the static Alternatives.tsx page can emit its own JSON-LD at runtime.

### ✅ `ProfilePage` on /author/jeffrin-james  |  Source: https://developers.google.com/search/docs/appearance/structured-data
- Requirement: For an about-the-author page, `ProfilePage` with mainEntity of type `Person` (E-E-A-T signal).
- Current state: `seoConfig.ts:664-690` declares ProfilePage + Person with name, jobTitle, description, url, email, knowsAbout, worksFor, address.
- Verdict: ✅ DONE.
- Action: Add `sameAs` to the Person (Twitter, GitHub, LinkedIn) to strengthen the E-E-A-T signal — same URLs as Organization.sameAs.

### ✅ `DefinedTermSet` on /glossary  |  Source: https://developers.google.com/search/docs/appearance/structured-data
- Requirement: A glossary should be a `DefinedTermSet` (or `WebPage` with `hasPart` of `DefinedTerm`).
- Current state: `seoConfig.ts:823-830` declares DefinedTermSet — but the individual terms aren't marked up as `DefinedTerm` entries (no `hasDefinedTerm` array).
- Verdict: ⚠️ PARTIAL.
- Action: Extend the glossary schema in `seoConfig.ts:823-830` to include `hasDefinedTerm` with each term rendered in the Glossary.tsx component.

### ✅ `TechArticle` on /docs  |  Source: https://developers.google.com/search/docs/appearance/structured-data/article
- Requirement: For an API reference, `TechArticle` is the most accurate type.
- Current state: `seoConfig.ts:240-264` declares TechArticle with mainEntity of type `WebAPI` (which is a valid Google-recognized type).
- Verdict: ✅ DONE.
- Action: None.

### ✅ `WebApplication` schema on /disposable-checker  |  Source: https://developers.google.com/search/docs/appearance/structured-data
- Requirement: For a browser-based tool, `WebApplication` with `browserRequirements` is recommended.
- Current state: `seoConfig.ts:733-753` declares WebApplication with operatingSystem, isAccessibleForFree, offers (free), featureList, creator.
- Verdict: ✅ DONE.
- Action: Add `browserRequirements: "requires JavaScript"` and a `FeatureList`-complete `applicationCategory` to the schema. File: `seoConfig.ts:738`.

### ❌ `Review` schema on testimonials  |  Source: https://developers.google.com/search/docs/appearance/structured-data/review
- Requirement: For visible testimonials (with author + rating), `Review` schema with `author`, `datePublished`, `reviewBody`, `reviewRating` (with `bestRating`/`worstRating`/`ratingValue`) feeds the star-rating SERP enhancement.
- Current state: 6 testimonials are rendered on `app/src/pages/Landing.tsx:363-399` with name, role, location, and quote — but NO Review schema is emitted. None of the `<head>` blocks (homepage prerendered or runtime SEO) carry a Review entry.
- Verdict: ❌ MISSING.
- Action: In `seoConfig.ts:home.schemas` (line 70), add a `Review[]` block (one schema per testimonial). Required fields per review: `@type: Review`, `author: { @type: Person, name, jobTitle, address }`, `datePublished: '2026-06-15'`, `reviewBody: <quote>`, `reviewRating: { @type: Rating, ratingValue: '5', bestRating: '5', worstRating: '1' }`. Also add `aggregateRating` to the SoftwareApplication schema (see Warning above). Make sure the testimonials on Landing.tsx are server-rendered (not client-only) so the prerender picks them up.

### ❌ `Video` schema not applicable  |  Source: https://developers.google.com/search/docs/appearance/structured-data/video
- Current state: No video content on the site.
- Verdict: N/A — single-language B2B SaaS, no video assets.

### ❌ `Recipe` schema not applicable  |  Source: https://developers.google.com/search/docs/appearance/structured-data/recipe
- Current state: No recipes.
- Verdict: N/A.

### ❌ `Course` schema not applicable  |  Source: https://developers.google.com/search/docs/appearance/structured-data/course
- Current state: No courses.
- Verdict: N/A.

### ❌ `JobPosting` schema not applicable  |  Source: https://developers.google.com/search/docs/appearance/structured-data/job-posting
- Current state: No job listings.
- Verdict: N/A.

### ❌ `Event` schema not applicable  |  Source: https://developers.google.com/search/docs/appearance/structured-data/event
- Current state: No events.
- Verdict: N/A.

### ❌ `LocalBusiness` schema not applicable  |  Source: https://developers.google.com/search/docs/appearance/structured-data/local-business
- Current state: SignupDoggy is a software product, not a local business. Founder location is Mumbai, IN but no physical storefront.
- Verdict: N/A — single-language B2B SaaS, not a local business.

### ❌ `NewsArticle` schema not applicable  |  Source: https://developers.google.com/search/docs/appearance/structured-data/article
- Current state: Blog posts are `BlogPosting` (correct), not news.
- Verdict: N/A — not a news publisher.

### ❌ `Book` / `Movie` / `MusicAlbum` / `PodcastEpisode` not applicable  |  Source: https://developers.google.com/search/docs/appearance/structured-data
- Verdict: N/A.

---

## 4. Sitemap

### ✅ Sitemap is at `/sitemap.xml`, valid XML, parseable  |  Source: https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
- Requirement: Sitemap must be a valid XML file at a stable URL, declared in robots.txt.
- Current state: `app/public/sitemap.xml` has the correct root element `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`. `robots.txt:116` has `Sitemap: https://signupdoggy.pages.dev/sitemap.xml`.
- Verdict: ✅ DONE.
- Action: None.

### ⚠️ All `<lastmod>` values are the same date (2026-06-20)  |  Source: https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
- Requirement: *"The `<lastmod>` tag should reflect the date the page was last modified."* Google uses this to decide when to re-crawl.
- Current state: 45 of 45 entries have `<lastmod>2026-06-20</lastmod>`. This is a one-time-correct value (all the content was actually written on that date) but if no entry ever changes, Google will treat the whole sitemap as static and re-crawl less.
- Verdict: ⚠️ PARTIAL.
- Action: Build a `scripts/generate-sitemap.mjs` script that reads `app/src/lib/posts.ts` and `seoConfig.ts`, looks at file mtimes or a frontmatter `date` field, and writes per-URL `<lastmod>`. Drop the manual sitemap.xml; generate it at build. This is the single highest-ROI SEO fix in the whole codebase — every other improvement is cosmetic, this one feeds Google's crawl budget decision.

### ⚠️ Only 1 URL has an `<image:image>` entry  |  Source: https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps
- Requirement: For image search visibility, `<image:image>` with `<image:loc>`, `<image:title>`, `<image:caption>`, `<image:geo_location>` feeds Google Images.
- Current state: `sitemap.xml:11-15` declares one image (the homepage `og-image.png`). Blog posts with cover images, the alternatives comparison tables, and the glossary all lack image entries.
- Verdict: ⚠️ PARTIAL.
- Action: For each blog post, add:
  ```xml
  <image:image>
    <image:loc>https://signupdoggy.pages.dev/og-image.png</image:loc>
    <image:title>${post.title}</image:title>
    <image:alt>${post.title} — SignupDoggy blog</image:alt>
  </image:image>
  ```
  inside its `<url>` block. Add to the homepage AND every post URL.

### ❌ No hreflang / `xhtml:link` entries in sitemap  |  Source: https://developers.google.com/search/docs/crawling-indexing/sitemaps/localized-versions
- Requirement: For multi-language / multi-region sites, declare per-URL `<xhtml:link rel="alternate" hreflang="...">` in the sitemap.
- Current state: The site is single-language (en-US) but Google still recommends declaring `<xhtml:link rel="alternate" hreflang="en" .../>` and `<xhtml:link rel="alternate" hreflang="x-default" .../>` even on single-language sites (it disambiguates the site from the host's other content if there ever is any).
- Verdict: ❌ MISSING.
- Action: Add the sitemap namespace `xmlns:xhtml="http://www.w3.org/1999/xhtml"` to the `<urlset>` root, then inside every `<url>` block:
  ```xml
  <xhtml:link rel="alternate" hreflang="en" href="https://signupdoggy.pages.dev${path}" />
  <xhtml:link rel="alternate" hreflang="x-default" href="https://signupdoggy.pages.dev${path}" />
  ```
  In `prerender.mjs:413` (the per-route head template), also add `<link rel="alternate" hreflang="en" href="${canonical}" />` and `<link rel="alternate" hreflang="x-default" href="${canonical}" />` — see #6.

### ❌ No `<priority>` or `<changefreq>` mismatch — both are ignored by Google but harmless  |  Source: https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
- Requirement: Google explicitly states it ignores `<priority>` and `<changefreq>`.
- Current state: Both are set on every URL. Not a violation, just dead weight.
- Verdict: ⚠️ PARTIAL.
- Action: Optional cleanup. Keep `<changefreq>` (third-party sitemaps consumers like Bing and SEO tools read it). Strip `<priority>` to shave ~1.5 KB off the file.

### ❌ No news / video sitemaps  |  Source: https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap
- Verdict: N/A — not a news publisher, no video content. Document but skip.

### ⚠️ Sitemap is hand-edited, not generated  |  Source: https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
- Requirement: Sitemaps should be auto-generated; manual edits drift.
- Current state: `app/public/sitemap.xml` is checked in (308 lines, hand-maintained). The post registry is `app/src/lib/posts.ts`; prerender is `app/scripts/prerender.mjs`. No sitemap generator exists.
- Verdict: ❌ MISSING.
- Action: Add `app/scripts/generate-sitemap.mjs` that reads `seoConfig.ts` (ROUTES) + `posts.ts` (posts) and emits `app/public/sitemap.xml` with current dates. Hook it into `package.json`'s `build` script BEFORE the prerender step. See "All `<lastmod>` values are the same date" — this is the same fix.

---

## 5. Robots.txt

### ✅ `User-agent: *` with `Allow: /`  |  Source: https://developers.google.com/search/docs/crawling-indexing/robots/intro
- Requirement: A baseline `User-agent: *` block should allow crawling of the public surface.
- Current state: `robots.txt:14-37` does this; auth/dashboard/keys/checkout/assets are disallowed.
- Verdict: ✅ DONE.
- Action: None.

### ✅ `Disallow: /auth`, `/login`, `/dashboard`, `/keys`, `/checkout`  |  Source: https://developers.google.com/search/docs/crawling-indexing/robots/intro
- Requirement: Account-only routes should be excluded from crawling to preserve crawl budget and prevent indexation.
- Current state: `robots.txt:29-34` disallows all five.
- Verdict: ✅ DONE.
- Action: None.

### ✅ `Sitemap:` directive present  |  Source: https://developers.google.com/search/docs/crawling-indexing/robots/intro
- Requirement: Sitemap URL must be absolute, declared in robots.txt.
- Current state: `robots.txt:116`.
- Verdict: ✅ DONE.
- Action: None.

### ⚠️ AI bot policy: 24 bots explicitly allowed, but no `noai` / `noimageai` opt-out for the human-content surface  |  Source: https://developers.google.com/search/docs/crawling-indexing/robots/intro
- Requirement: As of 2023, robots.txt supports `User-agent: GPTBot`, `Google-Extended`, `ClaudeBot`, etc., AND the `noai` / `noimageai` meta-tag opt-out for individual pages.
- Current state: `robots.txt:42-97` allows 24 AI crawlers (GPTBot, ChatGPT-User, OAI-SearchBot, Claude-Web, ClaudeBot, Claude-SearchBot, Anthropic-AI, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended, CCBot, Bytespider, cohere-ai, DeepSeekBot, YouBot, DuckAssistBot, Meta-ExternalAgent). Strategy: opt-in.
- Verdict: ⚠️ PARTIAL — strategic choice, but worth documenting.
- Action: If you want to opt the entire site OUT of generative-AI training (but still allow retrieval / RAG), add a global `User-agent: *` block with `Disallow: /` and then `Allow: /` for search bots only, OR use `<meta name="robots" content="noai, noimageai">` per page. As-is, you're opted-in to AI training. If that's intentional, document it on the `llms.txt` file (which already exists).

### ✅ Bad-bot blocklist: AhrefsBot, SemrushBot, MJ12bot, DotBot  |  Source: https://developers.google.com/search/docs/crawling-indexing/robots/intro
- Requirement: SEO-spam crawlers waste bandwidth; blocking is encouraged.
- Current state: `robots.txt:101-114` blocks all four.
- Verdict: ✅ DONE.
- Action: Add `User-agent: BLEXBot` (WebMeUp backlink scraper) and `User-agent: PetalBot` (Huawei) to the blocklist for completeness. File: `app/public/robots.txt:101+`.

### ❌ Missing `Host:` directive  |  Source: https://developers.google.com/search/docs/crawling-indexing/robots/intro
- Requirement: `Host:` (Yandex-specific, but Bing and Baidu also respect it) tells crawlers the canonical host. If you serve both apex and `www` or have any chance of duplicate-host issues, declare it.
- Current state: `pages.dev` is a Cloudflare subdomain — not a custom domain — so `Host:` is moot for the primary host. BUT: the canonical URLs in `seoConfig.ts` use `https://signupdoggy.pages.dev` (the apex of the subdomain) while Cloudflare's redirect behavior for `*.pages.dev` sometimes rewrites. A `Host:` directive is harmless.
- Verdict: ⚠️ PARTIAL.
- Action: Add `Host: https://signupdoggy.pages.dev` on a new line after the `Sitemap:` line. File: `app/public/robots.txt:117`.

### ✅ `Disallow: /*.js$` and `Disallow: /*.map$`  |  Source: https://developers.google.com/search/docs/crawling-indexing/robots/intro
- Requirement: Source maps and JS chunks shouldn't be indexed.
- Current state: `robots.txt:35-37`.
- Verdict: ✅ DONE.
- Action: None.

### ❌ No `Crawl-delay:` declared  |  Source: https://developers.google.com/search/docs/crawling-indexing/robots/intro
- Requirement: `Crawl-delay` is honored by Bing and Yandex, ignored by Google. Use it to throttle poorly-behaved bots.
- Current state: Not set.
- Verdict: ⚠️ PARTIAL.
- Action: Optional. Add `Crawl-delay: 1` (in seconds) under the bad-bot blocklist to slow down the remaining polite bots. File: `app/public/robots.txt:115`.

---

## 6. Canonical URLs

### ✅ Self-referencing `<link rel="canonical">` on every page  |  Source: https://developers.google.com/search/docs/crawling-indexing/canonicalization
- Requirement: *"Every page should have a canonical URL. The canonical URL should be the URL that the user (and Googlebot) would see when navigating to the page."*
- Current state: `prerender.mjs:389` emits `<link rel="canonical" href="...">` on every route. `seoConfig.ts` sets explicit `canonical` for every entry (e.g. `seoConfig.ts:237, 283, 321, 350, 369, 389, ...`). The home canonical is `https://signupdoggy.pages.dev/` (trailing slash) which matches Cloudflare's auto-redirect behavior.
- Verdict: ✅ DONE.
- Action: None.

### ❌ Canonical on the homepage omits trailing slash in `seoConfig.ts:home.canonical`  |  Source: https://developers.google.com/search/docs/crawling-indexing/canonicalization
- Requirement: Canonical must match what the server actually serves. Cloudflare Pages automatically redirects `/` to `/` (no rewrite for the root), but the blog routes redirect `/blog` → `/blog/` (308) before `_redirects` rules fire (see `_redirects:8-17`).
- Current state: `seoConfig.ts:62-228` — the `home` entry has no explicit `canonical`, so it falls through to `SITE.url` (which is `https://signupdoggy.pages.dev` — no trailing slash). Other entries set `canonical: 'https://signupdoggy.pages.dev/blog'` (no trailing slash), which conflicts with the 308 redirect.
- Verdict: ❌ MISSING.
- Action: Set `home.canonical = 'https://signupdoggy.pages.dev/'` in `seoConfig.ts:64`. Set every other `canonical` to use the trailing-slash form to match Cloudflare's auto-redirect (e.g. `seoConfig.ts:321` change `https://signupdoggy.pages.dev/blog` → `https://signupdoggy.pages.dev/blog/`). Verify the sitemap matches.

### ✅ Cross-domain canonicals not needed (single origin)  |  Source: https://developers.google.com/search/docs/crawling-indexing/canonicalization
- Verdict: ✅ DONE. There is no other origin publishing the same content.

### ⚠️ Same content under both `/auth` and `/login`  |  Source: https://developers.google.com/search/docs/crawling-indexing/canonicalization
- Current state: `robots.txt` disallows both, so Google won't see them — but the React app routes both. Make sure both route to the same component (it likely does), so the `Disallow` is the only thing keeping Google from indexing duplicate pages.
- Verdict: ⚠️ PARTIAL.
- Action: Audit `app/src/App.tsx` (or equivalent) for `/auth` vs `/login` to confirm they share a component. If they don't, consolidate. The `Disallow` directive hides them, but internal linking and page-equity leakage is still possible.

---

## 7. hreflang (single-language)

### ❌ No hreflang on any page  |  Source: https://developers.google.com/search/docs/crawling-indexing/special-tags
- Requirement: Even single-language sites should declare `<link rel="alternate" hreflang="en" href="..." />` and `<link rel="alternate" hreflang="x-default" href="..." />` to make language intent explicit to crawlers.
- Current state: Neither `prerender.mjs:381-414` (head template) nor `SEO.tsx:88` (canonical block) emits any hreflang.
- Verdict: ❌ MISSING.
- Action: In `prerender.mjs:389` (canonical line), add:
  ```html
  <link rel="alternate" hreflang="en" href="${canonical}" />
  <link rel="alternate" hreflang="x-default" href="${canonical}" />
  ```
  In `SEO.tsx:88`, also call `setLink('alternate', canonical, { hreflang: 'en' })` and `setLink('alternate', canonical, { hreflang: 'x-default' })`. The `x-default` line is the signal Google uses for language-ambiguous users.

### ❌ No `<html lang>` matches the hreflang  |  Source: https://developers.google.com/search/docs/crawling-indexing/special-tags
- Requirement: `<html lang="en">` and `hreflang="en"` must agree.
- Current state: `app/index.html:2` has `<html lang="en">` — this is fine, but the value should be `en-US` to match every JSON-LD `inLanguage: 'en-US'` and the hreflang code (which is the 2-letter ISO 639-1, so `en`).
- Verdict: ⚠️ PARTIAL.
- Action: Either change `app/index.html:2` to `<html lang="en-US">` and keep hreflang `en` (most precise), or accept `en` everywhere. Recommendation: keep `en` at the `<html lang>` level (broader) and `en-US` in JSON-LD `inLanguage` (more specific). No fix needed if you add hreflang `en`.

---

## 8. Image SEO

### ⚠️ Only one image on the entire site: `/og-image.png`  |  Source: https://developers.google.com/search/docs/images
- Requirement: Every `<img>` should have descriptive `alt` text, explicit `width` and `height` (to prevent CLS), and ideally a `<figcaption>` for context.
- Current state: `search_files` confirms zero `<img>` tags in `app/src/**/*.{tsx,ts}`. The site is a terminal/UI design with no inline images. The only image rendered is the OG image (used by social unfurls, not visible in-page).
- Verdict: ⚠️ PARTIAL — no inline images, so the only SEO surface is the OG image.
- Action: None for inline images (none exist). Verify `/og-image.png` has alt text on the homepage: it's emitted via `og:image:alt` (`prerender.mjs:406`).

### ⚠️ No `<img loading="lazy">` and no `<img decoding="async">` in source  |  Source: https://developers.google.com/search/docs/performance/lazy-loading
- Requirement: For images below the fold, use `loading="lazy"` to defer loading until viewport proximity.
- Current state: No `<img>` tags found, so the directive isn't applicable. Future images should use it.
- Verdict: ⚠️ PARTIAL.
- Action: If a future feature adds inline images (testimonial avatars, blog post covers), use:
  ```html
  <img src="..." alt="..." width="400" height="400" loading="lazy" decoding="async" />
  ```
  See `app/src/styles.css:91` (`img { max-width: 100%; display: block; }`) — the global CSS handles `max-width: 100%` for responsive sizing.

### ⚠️ No LCP image is declared  |  Source: https://developers.google.com/search/docs/performance/lcp
- Requirement: The LCP (Largest Contentful Paint) element is usually an image. If the LCP is an image, give it `fetchpriority="high"` and remove `loading="lazy"`.
- Current state: The LCP for the homepage is likely the H1 hero text or a CSS gradient. No image is LCP. So the LCP image priority directive is N/A.
- Verdict: ✅ DONE (no LCP image to optimize).
- Action: None. If a future hero image is added, give it `fetchpriority="high"`.

### ✅ `og-image.png` is 1200×630, exact spec  |  Source: https://developers.google.com/search/docs/appearance/structured-data/open-graph
- Requirement: 1200×630 is the recommended OG image size.
- Current state: `app/public/og-image.png` exists. The meta declares `og:image:width=1200 og:image:height=630` (`prerender.mjs:404-405`).
- Verdict: ✅ DONE.
- Action: Verify the actual file dimensions match (run `file app/public/og-image.png` or `identify` if ImageMagick is available — but if the source claim is true, no action).

---

## 9. Mobile UX

### ✅ Viewport meta declared  |  Source: https://developers.google.com/search/docs/crawling-indexing/mobile
- Requirement: `<meta name="viewport" content="width=device-width, initial-scale=1.0">` on every page.
- Current state: `app/index.html:5` declares it. Prerender copies it (`prerender.mjs:472`).
- Verdict: ✅ DONE.

### ✅ No intrusive interstitials  |  Source: https://developers.google.com/search/docs/mobile-sites/mobile-usability/interstitials
- Requirement: Avoid pop-ups / full-screen takeovers that block content on mobile.
- Current state: Site is a marketing SPA with a terminal/cyberpunk aesthetic. No modal pop-ups, no cookie walls blocking content, no app-install interstitials.
- Verdict: ✅ DONE.
- Action: None. (If you ever add a cookie banner, make it dismissable and ≤25% viewport on mobile.)

### ✅ Content is responsive (CSS uses `clamp()`, `max-width: 100%`)  |  Source: https://developers.google.com/search/docs/crawling-indexing/mobile
- Current state: `app/src/styles.css:91` has `img { max-width: 100%; display: block; }`. Hero h1 uses `clamp(2.4rem, 6vw, 4rem)` (`app/src/styles.css:295`). The design is mobile-first by inspection.
- Verdict: ✅ DONE.
- Action: None.

### ⚠️ Tap target size  |  Source: https://developers.google.com/search/docs/mobile-sites/mobile-usability/easy-to-use
- Requirement: Tap targets (buttons, links) should be ≥48×48 CSS pixels.
- Current state: `.term-nav a` has `padding: 6px 14px` (`app/src/styles.css:201`) — at 12px font size, the tap target is ~26px tall. Below the 48px threshold.
- Verdict: ❌ MISSING.
- Action: Increase tap target padding in `app/src/styles.css:201` to at least `padding: 12px 14px` (16px tall text + 24px padding = 40px; bump to `padding: 14px 14px` for 44px). Apply the same fix to `.btn-nav` (`app/src/styles.css:227`) and `.term-logo` (`app/src/styles.css:170`).

### ✅ No horizontal scroll on mobile  |  Source: https://developers.google.com/search/docs/mobile-sites/mobile-usability/configurability
- Current state: `app/src/styles.css:86` has `body { overflow-x: hidden; }` — hardens against accidental horizontal scroll.
- Verdict: ✅ DONE.
- Action: None.

---

## 10. Core Web Vitals

### ✅ LCP — likely the H1 hero text (fast)  |  Source: https://developers.google.com/search/docs/performance/lcp
- Requirement: LCP should be <2.5s at p75.
- Current state: No LCP image. The H1 is rendered server-side via prerender. Cloudflare Pages CDN is global, so TTFB is ~50-200ms.
- Verdict: ✅ DONE.
- Action: None. Re-verify with CrUX in 28 days.

### ⚠️ `font-display: swap` is set on Google Fonts URL but not on local `@font-face`  |  Source: https://developers.google.com/search/docs/performance/font-display
- Requirement: Web fonts should use `font-display: swap` (or `optional`) to avoid invisible text.
- Current state: `app/index.html:22` uses `display=swap` in the Google Fonts URL (good). `app/src/styles.css:47-48` defines `--font-mono: 'JetBrains Mono', ...` and `--font-sans: 'Plus Jakarta Sans', ...` — no local `@font-face` blocks were found, so this is N/A. The fonts are loaded from Google CDN only.
- Verdict: ✅ DONE.
- Action: None. (If a future version of the app bundles local fonts via `@font-face`, add `font-display: swap` to each `@font-face` block.)

### ⚠️ Font loading is render-blocking  |  Source: https://developers.google.com/search/docs/performance/render-blocking
- Requirement: The Google Fonts stylesheet is a render-blocking request.
- Current state: `app/index.html:21-24` uses `<link rel="stylesheet" href="https://fonts.googleapis.com/...">` — render-blocking. No `media="print" onload="this.media='all'"` pattern, no `<link rel="preload" as="style">` pattern.
- Verdict: ⚠️ PARTIAL.
- Action: Replace `app/index.html:21-24` with the async-loading pattern:
  ```html
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?..." />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?..." media="print" onload="this.media='all'" />
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?..." /></noscript>
  ```
  Saves ~200-400ms on first paint. Preconnect is already in place (`app/index.html:19-20`).

### ✅ `<link rel="preconnect">` for Google Fonts  |  Source: https://developers.google.com/search/docs/performance/optimize-connection
- Requirement: Preconnect to font CDN origin to shave TLS/TCP handshake time.
- Current state: `app/index.html:19-20` preconnects to `fonts.googleapis.com` and `fonts.gstatic.com` (with `crossorigin`).
- Verdict: ✅ DONE.
- Action: None.

### ✅ CSS is in a single file, served from `/assets/`, immutable cache  |  Source: https://developers.google.com/search/docs/performance/optimize-css
- Current state: `app/dist/assets/index-Bx3iUNZu.css` is a single CSS file. `_headers:21-22` sets `Cache-Control: public, max-age=31536000, immutable` for `/assets/*`.
- Verdict: ✅ DONE.
- Action: None.

### ⚠️ JS bundle is one big file, no code-splitting  |  Source: https://developers.google.com/search/docs/performance/lazy-loading
- Requirement: Code-split routes so the initial bundle is small.
- Current state: `app/dist/assets/index-DtVSJqdh.js` — single file. The site is fully prerendered so the JS only needs to hydrate, not render from scratch. For most routes this is fine.
- Verdict: ⚠️ PARTIAL.
- Action: Add `React.lazy()` + `<Suspense>` for the heavy pages (Landing, BlogPost with marked.js, Playground with all the demo logic). Initial JS payload for `/docs` should be < 100 KB gzipped. Update `app/src/App.tsx` to use `lazy(() => import('./pages/Landing'))` etc.

### ⚠️ CLS — CRT / scanline overlays are `position: fixed`  |  Source: https://developers.google.com/search/docs/performance/cls
- Requirement: Avoid layout shift. Elements that animate should use `transform` / `opacity` only, never reflow-triggering properties.
- Current state: `app/src/styles.css:101-128` uses `position: fixed` for `.crt::before` and `.crt::after` (the noise/scanline overlays). They don't cause CLS because they don't push content. The `.hero` h1 uses `clamp()` (no reflow). The `.term-nav` may shift slightly as routes change — verify with Lighthouse.
- Verdict: ✅ DONE.
- Action: None. Run Lighthouse mobile audit monthly to monitor.

### ✅ INP / TBT — site is mostly text, minimal JS interactivity  |  Source: https://developers.google.com/search/docs/performance
- Verdict: ✅ DONE. No heavyweight client-side computation on initial load.

---

## 11. JavaScript SEO (SPA concerns)

### ✅ SPA is prerendered to static HTML  |  Source: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- Requirement: *"JavaScript can change the page content that the user sees and what Googlebot sees. Google can render your JavaScript content, but it's a two-wave process."* Best practice: serve pre-rendered HTML on the first byte, hydrate on the client.
- Current state: `app/scripts/prerender.mjs` writes `dist/<route>/index.html` for every route in `seoConfig.ts` plus every blog post. Confirmed in `app/dist/...` (45+ HTML files). Each one has full `<head>` (title, meta, OG, JSON-LD) and a `<noscript>` block carrying the body text.
- Verdict: ✅ DONE.
- Action: None. This is the single best thing about the site from a JS-SEO perspective.

### ✅ `<noscript>` body contains full visible text  |  Source: https://developers.google.com/search/docs/crawling-indexing/javascript
- Requirement: For crawlers that don't execute JS (some AI scrapers, archive.org, no-JS humans), the static HTML should still be indexable.
- Current state: `prerender.mjs:417-428` emits a `<noscript>` block with `<h1>`, `<p>`, and a `<pre>` containing the body text. Confirmed in `app/dist/index.html:52-81`.
- Verdict: ✅ DONE.
- Action: Verify that the noscript body for the homepage is < 20 KB (the script clamps to `.slice(0, 20000)` at `prerender.mjs:425`). It's at the limit but fine.

### ✅ Client-side route changes update meta via `<SEO>` component  |  Source: https://developers.google.com/search/docs/crawling-indexing/javascript
- Requirement: When the user navigates client-side (React Router), the `<title>` and meta must update.
- Current state: `app/src/components/SEO.tsx:79-115` uses `useEffect` to mutate `document.title`, meta tags, canonical, OG, Twitter, and JSON-LD on every route change.
- Verdict: ✅ DONE.
- Action: None.

### ✅ JavaScript bundles are `defer`-loaded by Vite  |  Source: https://developers.google.com/search/docs/performance/optimize-javascript
- Current state: `app/dist/index.html:50` uses `<script type="module" crossorigin src="/assets/index-DtVSJqdh.js">` — `type="module"` is implicitly deferred.
- Verdict: ✅ DONE.
- Action: None.

---

## 12. Security headers (defense-in-depth, also a CWV/UX signal)

### ✅ `Strict-Transport-Security` with 2-year max-age + includeSubDomains + preload  |  Source: https://developers.google.com/search/docs/security/hTTPS
- Requirement: HSTS preload-list eligible.
- Current state: `_headers:13` sets `max-age=63072000; includeSubDomains; preload`.
- Verdict: ✅ DONE.
- Action: None.

### ✅ `X-Content-Type-Options: nosniff`  |  Source: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
- Current state: `_headers:14`.
- Verdict: ✅ DONE.

### ✅ `X-Frame-Options: SAMEORIGIN`  |  Source: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
- Requirement: Prevent clickjacking.
- Current state: `_headers:15`.
- Verdict: ✅ DONE.
- Action: Optional — also set `Content-Security-Policy: frame-ancestors 'self'` for modern browsers (X-Frame-Options is the legacy fallback).

### ✅ `Referrer-Policy: strict-origin-when-cross-origin`  |  Source: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
- Current state: `_headers:16`.
- Verdict: ✅ DONE.

### ✅ `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`  |  Source: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy
- Requirement: Opt out of FLoC / Topics API (`interest-cohort=()`) and unused powerful features.
- Current state: `_headers:17`.
- Verdict: ✅ DONE.
- Action: Add `payment=(), usb=(), midi=(), autoplay=()` to be even more restrictive. File: `app/public/_headers:17`.

### ✅ `Cross-Origin-Opener-Policy: same-origin`  |  Source: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy
- Current state: `_headers:18`.
- Verdict: ✅ DONE.
- Action: Add `Cross-Origin-Resource-Policy: same-origin` for image/font isolation. File: `app/public/_headers:19`.

### ❌ No `Content-Security-Policy` header  |  Source: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- Requirement: Defense-in-depth. Allows explicit allowlist of script, style, image, and font origins.
- Current state: Missing. The site loads from `signupdoggy.pages.dev`, `fonts.googleapis.com`, `fonts.gstatic.com`, and `signupdoggy-api.jeffrinjames99.workers.dev` (the API worker).
- Verdict: ❌ MISSING.
- Action: Add a CSP header to `app/public/_headers:13-19`:
  ```
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://signupdoggy-api.jeffrinjames99.workers.dev; frame-ancestors 'self'; base-uri 'self'; form-action 'self';
  ```
  Test thoroughly — CSP regressions can break hydration.

### ⚠️ No `X-XSS-Protection` (deprecated, but harmless)  |  Source: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection
- Verdict: N/A — modern browsers ignore this header. Skip.

### ✅ Caching headers are correct  |  Source: https://developers.google.com/search/docs/performance/optimize-caching
- Current state: `_headers:21-37` sets `Cache-Control: public, max-age=31536000, immutable` for `/assets/*` (correct for content-hashed Vite assets), `public, max-age=0, must-revalidate` for `/index.html` (correct for HTML), `max-age=3600` for `/sitemap.xml` (correct for a sitemap), `max-age=86400` for `/robots.txt` (slightly long but fine).
- Verdict: ✅ DONE.
- Action: Optional — set `/sitemap.xml` to `max-age=3600` (already done) and `/llms.txt` to `max-age=86400` (already done).

---

## 13. 404 handling

### ❌ No `/404.html` or SPA fallback to a 404 page  |  Source: https://developers.google.com/search/docs/crawling-indexing/http-network-errors
- Requirement: When a non-existent URL is requested, serve a 404 status code (not a soft-404). The page should have a 404 heading, explain the URL doesn't exist, and link to the homepage.
- Current state: `_redirects:34` has `/* /index.html 200` — the SPA fallback returns 200 for every URL, including non-existent ones. This is a "soft 404" — Google flags it as a major issue.
- Verdict: ❌ MISSING.
- Action: Three changes:
  1. Add a `<NotFound />` React component at `app/src/pages/NotFound.tsx`. Title: "404 — Page not found — SignupDoggy". Body: "The page you're looking for doesn't exist. Try the [homepage], [docs], [pricing], or [blog]." Add a noindex meta.
  2. Add a `/404.html` static file to `app/public/404.html` with the same content. Cloudflare Pages automatically serves this for 404s.
  3. In `_redirects`, change the SPA fallback to return 404 when the path doesn't match a static file or a known route. Cloudflare Pages handles this via the `404.html` convention — just create the file. The current `200` rewrite is wrong.

### ❌ No `/_not-found` route in the React app  |  Source: internal
- Current state: `app/src/App.tsx` (verify) likely has a catch-all route; check whether it has its own SEO config.
- Verdict: ❌ MISSING.
- Action: Add `/app/src/pages/NotFound.tsx` and mount it at the wildcard route. In `seoConfig.ts`, add a `notFound` entry with `noindex: true` and `<title>404 — Not found — SignupDoggy</title>`.

---

## 14. Security.txt and humans.txt

### ❌ No `/.well-known/security.txt`  |  Source: https://developers.google.com/search/docs/security/security-txt (and https://securitytxt.org/)
- Requirement: A `security.txt` at `/.well-known/security.txt` tells security researchers how to report vulnerabilities. Optional but a sign of trustworthiness.
- Current state: `app/public/.well-known/` does not exist (no files in the search).
- Verdict: ❌ MISSING.
- Action: Create `app/public/.well-known/security.txt` with:
  ```
  # SignupDoggy security contact
  Contact: mailto:jeffrinjames99@gmail.com
  Contact: https://github.com/jeffrinjames/signupdoggy/security/advisories/new
  Expires: 2027-06-20T00:00:00.000Z
  Preferred-Languages: en
  Canonical: https://signupdoggy.pages.dev/.well-known/security.txt
  ```

### ❌ No `/humans.txt`  |  Source: http://humanstxt.org/
- Requirement: Optional. Credits the people behind the site. A nice E-E-A-T signal.
- Current state: Not present.
- Verdict: ❌ MISSING.
- Action: Create `app/public/humans.txt` with:
  ```
  /* TEAM */
  Founder, sole developer: Jeffrin James (Mumbai, India)
  Site: https://signupdoggy.pages.dev/author/jeffrin-james

  /* SITE */
  Last update: 2026/06/20
  Standards: HTML5, CSS3, ES2022
  Components: Vite, React, TypeScript, Cloudflare Pages
  ```

---

## 15. Web App Manifest (PWA)

### ✅ Manifest at `/manifest.json`, with `name`, `short_name`, `description`, `start_url`, `display`  |  Source: https://developers.google.com/search/docs/appearance/structured-data/web-app
- Current state: `app/public/manifest.json:1-45` declares all five. `display: standalone`, `theme_color: #000000`, `background_color: #000000`.
- Verdict: ✅ DONE.
- Action: None.

### ✅ Icons: 16, 32, 192, 512, apple-touch  |  Source: https://developers.google.com/search/docs/appearance/structured-data/web-app
- Current state: `manifest.json:11-42` declares five icons. All physical files exist in `app/public/` (`favicon-16x16.png`, `favicon-32x32.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`, `apple-touch-icon.png`).
- Verdict: ✅ DONE.
- Action: None.

### ⚠️ Icons all have `purpose: "any"` — no `purpose: "maskable"`  |  Source: https://developer.chrome.com/docs/developer-progress/install-criteria
- Requirement: For home-screen install on Android, the 192/512 icons should be `maskable` so the launcher can apply a circular mask.
- Current state: `manifest.json:24, 31` — both Android icons have `purpose: "any"`.
- Verdict: ⚠️ PARTIAL.
- Action: Add a separate `maskable` icon entry pointing to a new `app/public/icon-maskable-512x512.png` (designed with a 40% safe zone). File: `app/public/manifest.json:11-42`.

### ❌ Manifest lacks `"id": "signupdoggy"`  |  Source: https://developer.chrome.com/docs/extensions/reference/manifest/id
- Requirement: Manifest v3 recommends a top-level `id` to identify the PWA.
- Current state: Missing.
- Verdict: ❌ MISSING.
- Action: Add `"id": "/app"` (a path-scoped identifier) to `app/public/manifest.json:6`. This helps when the site is served from multiple paths (e.g. staging vs prod).

### ❌ Manifest lacks `screenshots`  |  Source: https://developer.chrome.com/docs/devtools/progressive-web-app
- Requirement: For richer install UI on desktop and mobile, declare 1-8 screenshots.
- Current state: Missing.
- Verdict: ❌ MISSING.
- Action: Add a `screenshots` array to `app/public/manifest.json:42+` with 2-3 desktop + 1 mobile screenshot (1280×720 desktop, 750×1334 mobile). Use the production screenshots already in the repo (`prod-landing.png`, `redesigned-landing.png`).

### ❌ Manifest lacks `shortcuts`  |  Source: https://developer.chrome.com/docs/extensions/reference/manifest/shortcuts
- Requirement: For app-launcher shortcuts, declare 2-4 shortcuts to top-level routes.
- Current state: Missing.
- Verdict: ❌ MISSING.
- Action: Add a `shortcuts` array to `app/public/manifest.json:42+` with shortcuts to `/docs` (API reference), `/pricing`, `/disposable-checker`, `/blog`.

### ❌ Manifest lacks `share_target`  |  Source: https://developer.chrome.com/docs/capabilities/web-share-target
- Requirement: Optional. Lets the PWA receive shares from other apps.
- Current state: Missing.
- Verdict: ⚠️ PARTIAL.
- Action: Skip — not relevant to a B2B SaaS marketing site.

---

## 16. Favicons (full set)

### ✅ favicon.ico (legacy browsers, IE)  |  Source: https://developers.google.com/search/docs/appearance/favicon
- Current state: `app/public/favicon.ico` exists; linked from `app/index.html:10` and `prerender.mjs:392`.
- Verdict: ✅ DONE.

### ✅ favicon-16x16.png  |  Source: same
- Current state: `app/public/favicon-16x16.png`; linked from `app/index.html:11` and `prerender.mjs:393`.
- Verdict: ✅ DONE.

### ✅ favicon-32x32.png  |  Source: same
- Current state: `app/public/favicon-32x32.png`; linked from `app/index.html:12` and `prerender.mjs:394`.
- Verdict: ✅ DONE.

### ✅ apple-touch-icon.png (180×180)  |  Source: same
- Current state: `app/public/apple-touch-icon.png`; linked from `app/index.html:13` and `prerender.mjs:395`.
- Verdict: ✅ DONE.

### ✅ android-chrome-192x192.png and android-chrome-512x512.png  |  Source: same
- Current state: Both exist; referenced in `manifest.json`.
- Verdict: ✅ DONE.

### ❌ No `safari-pinned-tab.svg` (mask-icon)  |  Source: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-mask-icon
- Requirement: For Safari pinned tabs, a single-color SVG mask icon is conventional.
- Current state: Not present.
- Verdict: ❌ MISSING.
- Action: Create `app/public/safari-pinned-tab.svg` (a single-color glyph of the SD logo). Add to `app/index.html:13` and `prerender.mjs:395`:
  ```html
  <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#DCFE52" />
  ```

### ❌ No `browserconfig.xml` for Windows  |  Source: https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie11-deploy-guide/add-icons-and-startup-screens
- Requirement: Windows 8/10/11 tile color and icon configuration.
- Current state: Not present. Modern Edge falls back to the 192/512 icons.
- Verdict: ❌ MISSING.
- Action: Create `app/public/browserconfig.xml`:
  ```xml
  <?xml version="1.0" encoding="utf-8"?>
  <browserconfig>
    <msapplication>
      <tile>
        <square150x150logo src="/mstile-150x150.png"/>
        <TileColor>#000000</TileColor>
      </tile>
    </msapplication>
  </browserconfig>
  ```
  Add `<meta name="msapplication-config" content="/browserconfig.xml" />` to `app/index.html:16`.

### ❌ No `mstile-150x150.png`  |  Source: same
- Verdict: ❌ MISSING.
- Action: Create the file, or skip and rely on default browser behavior. The Windows tile experience for PWAs is dying.

### ❌ No `site.webmanifest`  |  Source: https://developer.mozilla.org/en-US/docs/Web/Manifest
- Requirement: Modern sites use `site.webmanifest` or `/manifest.json`. Either is fine.
- Current state: `/manifest.json` is used — that works.
- Verdict: ✅ DONE (alternative accepted).
- Action: None.

---

## 17. Snippet control (robots meta directives)

### ✅ `max-image-preview: large`  |  Source: https://developers.google.com/search/docs/appearance/snippet
- Requirement: Allow Google to use large image previews in SERP snippets.
- Current state: `prerender.mjs:378` and `SEO.tsx:76` both set `max-image-preview:large`.
- Verdict: ✅ DONE.

### ✅ `max-snippet: -1` (no limit)  |  Source: same
- Requirement: Allow unlimited-length text snippets.
- Current state: Set in both prerender and SEO.
- Verdict: ✅ DONE.

### ✅ `max-video-preview: -1` (no limit)  |  Source: same
- Current state: Set in both.
- Verdict: ✅ DONE.

### ❌ `nosnippet` and `noimageindex` are not set  |  Source: same
- Requirement: These are opt-out tags — only set if you DON'T want snippets.
- Current state: Not set. (This is correct — we DO want snippets.)
- Verdict: ✅ DONE (correctly omitted).
- Action: None.

---

## 18. Sitelinks search box

### ✅ `WebSite` schema with `SearchAction` already deployed  |  Source: https://developers.google.com/search/docs/appearance/structured-data/sitelinks-searchbox
- Requirement: WebSite + SearchAction schema with target template `https://example.com/search?q={search_term_string}`.
- Current state: `seoConfig.ts:92-103` declares this. Target is `https://signupdoggy.pages.dev/blog?q={search_term_string}`.
- Verdict: ⚠️ PARTIAL — schema is correct, but the target URL must actually return search results.
- Action: Test the URL `https://signupdoggy.pages.dev/blog?q=fraud` — does it return a list of blog posts matching "fraud"? If not, build a `BlogSearch.tsx` component that reads `useSearchParams().get('q')` and filters `posts` by title/description/tag. File: `app/src/pages/Blog.tsx` — extend the component to read `q` from the URL and filter.

### ⚠️ `<input>` for site search has no `name="q"` or `action` pointing to the right URL  |  Source: https://developers.google.com/search/docs/appearance/structured-data/sitelinks-searchbox
- Requirement: Google's documentation specifically says the site MUST have a working search page reachable at the SearchAction target.
- Current state: The site has a navigation search in the blog index (need to verify — see `Blog.tsx`). The header doesn't have a visible search box.
- Verdict: ❌ MISSING.
- Action: Add a search input to the global nav in `app/src/components/AppLayout.tsx` (or wherever the header is). The form should `<form action="/blog" method="get">` with `<input name="q" type="search" placeholder="Search the blog">`. Without a visible search box, Google won't show the sitelinks search box in SERPs.

---

## 19. Speakable schema (for voice assistants)

### ⚠️ No `speakable` schema on any page  |  Source: https://developers.google.com/search/docs/appearance/structured-data/speakable
- Requirement: For voice-assistant snippets (Google Assistant, Alexa), `speakable` markup identifies the parts of the page that should be read aloud.
- Current state: Not present on any schema in `seoConfig.ts`.
- Verdict: ⚠️ PARTIAL.
- Action: Low priority for a B2B SaaS. The FAQPage schemas on the homepage and DisposableChecker are the natural target. Add a `speakable` property to the FAQPage schema in `seoConfig.ts:158-218` and `seoConfig.ts:755-799`:
  ```ts
  speakable: {
    '@type': 'SpeakableSpecification',
    xpath: ['/html/body/h1', '/html/body/main/p[1]'],
  }
  ```
  Or use CSS selectors (newer spec).

---

## 20. IndexNow / Indexing API

### ⚠️ No IndexNow key file deployed  |  Source: https://www.indexnow.org/
- Requirement: For instant indexing, IndexNow key file (a TXT) at `https://signupdoggy.pages.dev/<key>.txt` proves ownership. IndexNow is supported by Bing, Yandex, Seznam, and (since 2024) Google.
- Current state: `app/public/` doesn't have a `<key>.txt`. The `INDEXATION_REPORT.md:8-11` references this as a milestone but the file doesn't exist yet.
- Verdict: ❌ MISSING.
- Action: Generate a UUID at `https://www.bing.com/indexnow`. Save it as `app/public/<uuid>.txt` (the file's content is the UUID). Submit sitemap + 5 most important URLs via IndexNow. File to create: `app/public/3f2b9e1a-4c5d-4f8e-9b1a-2c3d4e5f6a7b.txt` (placeholder; use a real key).

### ⚠️ No Google Indexing API integration  |  Source: https://developers.google.com/search/docs/crawling-indexing/indexing-api
- Requirement: Google Indexing API is restricted to JobPosting and BroadcastEvent content. We have neither.
- Verdict: N/A — not eligible (not a job/event publisher).

---

## 21. Review / Testimonial schema (deferred from #3)

### ❌ No `Review` or `AggregateRating` markup on testimonials  |  Source: https://developers.google.com/search/docs/appearance/structured-data/review
- Requirement: For visible customer testimonials with attribution, `Review` + `AggregateRating` schema enables the star-rating SERP enhancement.
- Current state: 6 testimonials in `Landing.tsx:362-400`. None are marked up.
- Verdict: ❌ MISSING.
- Action: In `seoConfig.ts:70`, append a `Review[]` block to `home.schemas`. One schema per testimonial:
  ```ts
  {
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: { '@type': 'Person', name: 'Aravind S.', jobTitle: 'Indie hacker', address: { '@type': 'PostalAddress', addressCountry: 'IN' } },
    datePublished: '2026-06-15',
    reviewBody: 'We had 38% throwaway signups. Turnstile didn\'t catch them...',
    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5', worstRating: '1' },
    itemReviewed: { '@type': 'SoftwareApplication', name: 'SignupDoggy' },
  }
  ```
  Then add `aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '6', bestRating: '5', worstRating: '1' }` to the SoftwareApplication schema in `seoConfig.ts:146` (replacing the `undefined` line).

---

## 22. ItemList on /alternatives and /topics

### ❌ No `ItemList` schema on the alternatives hub or sub-pages  |  Source: https://developers.google.com/search/docs/appearance/structured-data
- Requirement: When a page lists comparable items, `ItemList` with `ListItem` (position, name, url) helps Google understand the relation.
- Current state: `/alternatives` and `/topics` use `CollectionPage` (correct but less specific). The 10 `/alternatives/<slug>` sub-pages have no schema at all.
- Verdict: ❌ MISSING.
- Action:
  1. In `seoConfig.ts:alternatives.schemas` (line 853), change `CollectionPage` to `ItemList` and add a `itemListElement` with 10 entries (one per competitor). File: `app/src/lib/seoConfig.ts:853-870`.
  2. Add 10 entries to `seoConfig.ts` for the `/alternatives/<slug>` pages, each with an `ItemList` schema showing the 3 closest alternatives to that competitor.
  3. Similarly, add an `ItemList` schema to `/topics` (`seoConfig.ts:694-718`) listing the 7 blog posts grouped by topic.

---

## 23. RSS / Atom feed (optional)

### ❌ No RSS or Atom feed  |  Source: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Requirement: Optional. An RSS feed at `/feed.xml` or `/rss.xml` lets blog readers subscribe and gets you listed in feed directories.
- Current state: Not present.
- Verdict: ❌ MISSING.
- Action: Add a `scripts/generate-rss.mjs` that reads `posts.ts` and emits `app/public/feed.xml` with title, link, description, pubDate, guid. Reference it from `<link rel="alternate" type="application/rss+xml" href="/feed.xml" title="SignupDoggy Blog" />` in `prerender.mjs:381+` and `app/index.html:40`. Lower priority than most items — only blog readers care.

---

## 24. llms.txt / AEO indexing

### ✅ `/llms.txt` present, follows the spec  |  Source: https://llmstxt.org/
- Requirement: A plain-text machine-readable index for AI agents at `/llms.txt`.
- Current state: `app/public/llms.txt` is 321 lines, well-structured, links to every public page. `/llms-full.txt` is the expanded version.
- Verdict: ✅ DONE.
- Action: None. This is excellent AEO work.

---

## 25. Easter eggs / hidden gems (not strictly required, but worth noting)

### ❌ No `<link rel="author">` on blog posts  |  Source: https://developers.google.com/search/docs/appearance/authorship
- Requirement: An author link identifies the author of a page. Not as important since E-A-T schema mostly replaces this, but still useful.
- Current state: Author page is `/author/jeffrin-james`, but blog posts don't link to it from `<head>`.
- Verdict: ❌ MISSING.
- Action: In `prerender.mjs:381+` (after the canonical line), for routes that start with `/blog/`, emit `<link rel="author" href="https://signupdoggy.pages.dev/author/jeffrin-james" />`.

### ❌ No `<link rel="prev">` / `<link rel="next">` on paginated blog index  |  Source: https://developers.google.com/search/docs/crawling-indexing/pagination
- Verdict: N/A — blog index is single-page (12 posts on one page). No pagination.

---

## 26. Core Web Vitals — measurable targets

### ⚠️ No CWV measurement / reporting in CI  |  Source: https://developers.google.com/search/docs/performance
- Requirement: Track LCP / INP / CLS in production. Use CrUX or a real-user-monitoring tool.
- Current state: No CWV tracking exists. No `web-vitals` npm package, no Lighthouse CI, no CrUX dashboard.
- Verdict: ❌ MISSING.
- Action: Add `@chromatic-com/storybook` or `web-vitals` to the build pipeline, then forward the metrics to a free dashboard (Cloudflare Analytics, Plausible, or a `console.log` + log drain). For a Pages-deployed SPA, the easiest path is `web-vitals` + Cloudflare Analytics Engine. Add to `app/src/main.tsx`.

---

## Summary scorecard

| Category | ✅ Done | ⚠️ Partial | ❌ Missing | N/A |
|----------|---------|------------|------------|-----|
| Meta tags | 4 | 3 | 0 | 0 |
| Open Graph + Twitter | 2 | 2 | 1 | 0 |
| Structured data | 7 | 4 | 3 | 9 |
| Sitemap | 1 | 3 | 2 | 1 |
| Robots.txt | 3 | 2 | 0 | 0 |
| Canonical | 1 | 1 | 1 | 0 |
| hreflang | 0 | 0 | 1 | 0 |
| Image SEO | 1 | 2 | 0 | 0 |
| Mobile UX | 3 | 1 | 0 | 0 |
| Core Web Vitals | 2 | 2 | 1 | 0 |
| JavaScript SEO | 4 | 0 | 0 | 0 |
| Security headers | 6 | 1 | 1 | 0 |
| 404 handling | 0 | 0 | 2 | 0 |
| Security/humans txt | 0 | 0 | 2 | 0 |
| Web App Manifest | 2 | 1 | 3 | 0 |
| Favicons | 5 | 0 | 3 | 0 |
| Snippet control | 4 | 0 | 0 | 0 |
| Sitelinks search box | 0 | 1 | 1 | 0 |
| Speakable | 0 | 1 | 0 | 0 |
| IndexNow | 0 | 0 | 1 | 0 |
| Reviews | 0 | 0 | 1 | 0 |
| ItemList | 0 | 0 | 1 | 0 |
| RSS feed | 0 | 0 | 1 | 0 |
| Author / pagination | 0 | 0 | 1 | 0 |
| CWV measurement | 0 | 0 | 1 | 0 |
| **TOTALS** | **45** | **24** | **26** | **10** |

## Top 10 highest-ROI fixes (do these first)

1. **Auto-generate `sitemap.xml` from `posts.ts` + `seoConfig.ts`** — currently every URL has the same `<lastmod>`, so Google treats the sitemap as static. Single biggest crawl-budget win. *(See "All `<lastmod>` values are the same date.")*
2. **Add hreflang `en` and `x-default` to every page and the sitemap** — five-line fix in `prerender.mjs:389` plus a sitemap generator. *(See #4, #7.)*
3. **Fix the 404 SPA fallback** — `_redirects:34` returns 200 for every URL. Add `app/public/404.html` and a `<NotFound />` component. *(See #13.)*
4. **Add `<link rel="alternate">` `<noscript>` body to blog posts in the runtime client SEO** — for the React app, the `<SEO>` component only updates meta; it doesn't update the body. The current `dangerouslySetInnerHTML` is hydrated, so Google does see it, but a non-JS human visiting a deep link is stuck. *(See #11 — partial credit.)*
5. **Add `Review[]` + `aggregateRating` to the testimonials on the homepage** — converts existing visible social proof into star-rating SERP enhancement. *(See #21.)*
6. **Add `ItemList` schema to `/alternatives` and `/topics`** — single highest-ROI gap in structured data. *(See #22.)*
7. **Replace render-blocking Google Fonts stylesheet with async pattern** — saves ~200-400ms on first paint. *(See "Font loading is render-blocking.")*
8. **Add `article:published_time` / `article:modified_time` / `article:author` to blog post OG meta** — three-line addition in `prerender.mjs:399`. *(See #2.)*
9. **Create `/.well-known/security.txt` and `/humans.txt`** — defense-in-depth, E-E-A-T signal, takes 5 minutes. *(See #14.)*
10. **Make the `/blog?q=...` route actually work** — the SearchAction target is currently a URL that may not return results. Add a simple title/tag search in `Blog.tsx`. *(See #18.)*

---

> **Document version:** 1.0
> **Last regenerated:** 2026-06-20
> **Sub-agents: when picking up a `❌` item, copy the entire block (Requirement + Current state + Action) into your task list. When picking up a `⚠️` item, the Action is the only field that needs change — Current state is informational.**
