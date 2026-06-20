import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth';
import Landing from './pages/Landing';
import Docs from './pages/Docs';
import Pricing from './pages/Pricing';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ApiKeys from './pages/ApiKeys';
import Auth from './pages/Auth';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Checkout from './pages/Checkout';
import StaticPage from './pages/StaticPage';
import Author from './pages/Author';
import Topics from './pages/Topics';
import DisposableChecker from './pages/DisposableChecker';
import Glossary from './pages/Glossary';
import Alternatives from './pages/Alternatives';
import { SITE, ROUTES as SEO_ROUTES } from './lib/seoConfig';

// Body text imports for static pages. These are the same strings the
// prerender script uses to write <noscript> blocks. Kept in one place
// (this file) so the React and prerender outputs always agree.
import { COMPARE_BODIES, USE_CASE_BODIES, INTEGRATIONS_BODY, CHANGELOG_BODY } from './lib/staticBodies';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen dark"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="app">
      <main className="main">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/keys" element={<RequireAuth><ApiKeys /></RequireAuth>} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* ═══ COMPARISON PAGES (high buyer intent) ═══════════════════════ */}
          <Route path="/vs/ipqualityscore" element={<StaticPage config={SEO_ROUTES.vsIpqualityscore} body={COMPARE_BODIES['/vs/ipqualityscore']} bannerCmd="./compare --vs=ipqualityscore" bannerStatus="COMPARISON" />} />
          <Route path="/vs/maxmind" element={<StaticPage config={SEO_ROUTES.vsMaxmind} body={COMPARE_BODIES['/vs/maxmind']} bannerCmd="./compare --vs=maxmind" bannerStatus="COMPARISON" />} />
          <Route path="/vs/sift" element={<StaticPage config={SEO_ROUTES.vsSift} body={COMPARE_BODIES['/vs/sift']} bannerCmd="./compare --vs=sift" bannerStatus="COMPARISON" />} />
          <Route path="/vs/cloudflare-turnstile" element={<StaticPage config={SEO_ROUTES.vsTurnstile} body={COMPARE_BODIES['/vs/cloudflare-turnstile']} bannerCmd="./compare --vs=turnstile" bannerStatus="COMPARISON" />} />

          {/* ═══ USE-CASE PAGES (long-tail, high buyer intent) ═══════════════ */}
          <Route path="/use-cases/indie-hackers" element={<StaticPage config={SEO_ROUTES.useIndieHackers} body={USE_CASE_BODIES['/use-cases/indie-hackers']} bannerCmd="./use-case --for=indie-hackers" bannerStatus="USE CASE" />} />
          <Route path="/use-cases/saas-startups" element={<StaticPage config={SEO_ROUTES.useSaasStartups} body={USE_CASE_BODIES['/use-cases/saas-startups']} bannerCmd="./use-case --for=saas-startups" bannerStatus="USE CASE" />} />
          <Route path="/use-cases/ecommerce" element={<StaticPage config={SEO_ROUTES.useEcommerce} body={USE_CASE_BODIES['/use-cases/ecommerce']} bannerCmd="./use-case --for=ecommerce" bannerStatus="USE CASE" />} />

          {/* ═══ INTEGRATIONS PAGE ════════════════════════════════════════════ */}
          <Route path="/integrations" element={<StaticPage config={SEO_ROUTES.integrations} body={INTEGRATIONS_BODY} bannerCmd="./integrations --list" bannerStatus="DOCS" />} />

          {/* ═══ CHANGELOG ════════════════════════════════════════════════════ */}
          <Route path="/changelog" element={<StaticPage config={SEO_ROUTES.changelog} body={CHANGELOG_BODY} bannerCmd="./changelog --read" bannerStatus="RELEASE NOTES" />} />

          {/* ═══ AUTHOR PAGE (E-E-A-T) ════════════════════════════════════════ */}
          <Route path="/author/jeffrin-james" element={<Author />} />

          {/* ═══ TOPICS HUB (pillar content) ═════════════════════════════════ */}
          <Route path="/topics" element={<Topics />} />

          {/* ═══ FREE TOOL: DISPOSABLE EMAIL CHECKER ═══════════════════════════ */}
          <Route path="/disposable-checker" element={<DisposableChecker config={SEO_ROUTES.disposableChecker} />} />

          {/* ═══ GLOSSARY (educational pillar) ═════════════════════════════════ */}
          <Route path="/glossary" element={<Glossary />} />

          {/* ═══ ALTERNATIVES HUB + PER-TOOL PAGES ════════════════════════════ */}
          <Route path="/alternatives" element={<Alternatives />} />
          <Route path="/alternatives/:slug" element={<Alternatives />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}