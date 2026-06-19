// useSEO — convenience hook to grab the SEO config for a route and
// mount the <SEO /> component in one line.
//
//   useSEO(ROUTES.blog);
//   useSEO(getBlogPostSeo(slug));
//
// The hook just centralizes the import + the empty render. We
// deliberately do NOT use react-router's useLocation to derive the
// config — pages should be explicit about their SEO because the
// route → config mapping is not 1:1 (a single route can host
// multiple configs depending on params).

import { SEO } from '../components/SEO';
import type { SeoConfig } from './seoConfig';

export function useSEO(config: SeoConfig): null {
  return <SEO config={config} /> as unknown as null;
}

export { SEO } from '../components/SEO';
export type { SeoConfig };
