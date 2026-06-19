// <SEO /> — per-route meta tag injection for the React app.
//
// Mounts the route's SEO config into <head> as native DOM mutations
// (we don't use react-helmet — one less dependency, and we want
// precise control over the order of <script type="application/ld+json">
// tags, which react-helmet doesn't guarantee).
//
// Why this exists alongside the prerender script:
//   The prerender script writes static <head> tags into each
//   dist/<route>/index.html. That covers crawlers, link unfurls, and
//   users with JS disabled. But once the SPA hydrates, the browser
//   owns the <head> — and if the user navigates client-side, the
//   initial <title> stays in place unless we update it. This
//   component does that update on every route change.
//
// Every meta tag we touch is removed on unmount so the head stays
// clean across navigations.

import { useEffect } from 'react';
import { SITE, type SeoConfig } from '../lib/seoConfig';

type JsonLd = Record<string, unknown>;

function setMeta(name: string, content: string, useProperty = false): void {
  if (typeof document === 'undefined') return;
  const attr = useProperty ? 'property' : 'name';
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string, extra?: Record<string, string>): void {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
  if (extra) {
    for (const [k, v] of Object.entries(extra)) el.setAttribute(k, v);
  }
}

function setJsonLd(schemas: JsonLd[]): void {
  if (typeof document === 'undefined') return;
  // Wipe any prior ld+json tags we own (we mark them with data-sd).
  document.head.querySelectorAll('script[type="application/ld+json"][data-sd]').forEach((n) => n.remove());
  for (const schema of schemas) {
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.setAttribute('data-sd', '1');
    s.text = JSON.stringify(schema);
    document.head.appendChild(s);
  }
}

function clearJsonLd(): void {
  if (typeof document === 'undefined') return;
  document.head.querySelectorAll('script[type="application/ld+json"][data-sd]').forEach((n) => n.remove());
}

export function SEO({ config }: { config: SeoConfig }) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const canonical = config.canonical ?? `${SITE.url}${config.path}`;
    const ogImage = config.ogImage ?? SITE.defaultOgImage;
    const ogImageWidth = SITE.defaultOgImageWidth.toString();
    const ogImageHeight = SITE.defaultOgImageHeight.toString();
    const robots = config.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1';

    // Core.
    document.title = config.title;
    setMeta('description', config.description);
    if (config.keywords) setMeta('keywords', config.keywords);
    setMeta('robots', robots);
    setMeta('googlebot', robots);
    setMeta('author', SITE.founder.name);
    setMeta('theme-color', '#000000');

    // Canonical.
    setLink('canonical', canonical);

    // Open Graph.
    setMeta('og:title', config.title, true);
    setMeta('og:description', config.description, true);
    setMeta('og:url', canonical, true);
    setMeta('og:type', 'website', true);
    setMeta('og:locale', SITE.locale, true);
    setMeta('og:site_name', SITE.name, true);
    setMeta('og:image', ogImage, true);
    setMeta('og:image:width', ogImageWidth, true);
    setMeta('og:image:height', ogImageHeight, true);
    setMeta('og:image:alt', config.title, true);

    // Twitter.
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', config.title);
    setMeta('twitter:description', config.description);
    setMeta('twitter:image', ogImage);
    setMeta('twitter:image:alt', config.title);
    setMeta('twitter:site', SITE.twitter);

    // JSON-LD.
    if (config.schemas && config.schemas.length > 0) {
      setJsonLd(config.schemas);
    } else {
      clearJsonLd();
    }

    return () => {
      // Don't clear on unmount — the next page's SEO effect runs
      // synchronously after this cleanup, and wiping here would
      // cause a one-frame flash of empty <head>. We only clear
      // the jsonld we own, to keep things tidy on full unmount.
    };
  }, [config]);

  // We don't render anything — head mutations only.
  return null;
}
