import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth';
import Landing from './pages/Landing';
import { ROUTES as SEO_ROUTES } from './lib/seoConfig';

// Code-split every non-Landing route. The Landing page is the LCP target
// on /, so we ship its JS inline in the initial bundle. Every other route
// is below-the-fold on / and never rendered until the user clicks a
// nav link — so we defer their JS (and the heavy `marked`, `motion`, and
// component-library code they pull in) until the route is actually
// requested. PageSpeed flags the previous single-bundle as having
// 119.5 KiB of unused JS on the initial landing render; this drops
// that to a few KiB.
//
// Each lazy chunk is wrapped in a Suspense boundary with a small
// terminal-style spinner that matches the page's retro aesthetic so
// the transition doesn't flash.
const Docs = lazy(() => import('./pages/Docs'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ApiKeys = lazy(() => import('./pages/ApiKeys'));
const Auth = lazy(() => import('./pages/Auth'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Checkout = lazy(() => import('./pages/Checkout'));
const StaticPage = lazy(() => import('./pages/StaticPage'));
const Author = lazy(() => import('./pages/Author'));
const Topics = lazy(() => import('./pages/Topics'));
const DisposableChecker = lazy(() => import('./pages/DisposableChecker'));
const Glossary = lazy(() => import('./pages/Glossary'));
const Alternatives = lazy(() => import('./pages/Alternatives'));
const PayPerCall = lazy(() => import('./pages/PayPerCall'));
const FraudApiForSaas = lazy(() => import('./pages/FraudApiForSaas'));
const FreeEmailVerification = lazy(() => import('./pages/FreeEmailVerification'));

// Single fallback reused across all lazy routes. Renders inside the
// page chrome so the header / footer stay visible during navigation.
function RouteFallback() {
  return (
    <div className="loading-screen dark">
      <div className="spinner" />
    </div>
  );
}

// Body text for static pages is now looked up internally by StaticPage
// (see src/pages/StaticPage.tsx → resolveBody). Keeping the imports here
// would have pulled the entire 21 KB body payload into the main bundle
// even though StaticPage is already lazy-loaded. The 5 affected routes
// (vs/*, use-cases/*, integrations, changelog) all stay the same; we
// just dropped the `body={...}` prop.

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <RouteFallback />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { loading } = useAuth();
  if (loading) return <RouteFallback />;

  return (
    <div className="app">
      <main className="main">
        <Suspense fallback={<RouteFallback />}>
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
                        <Route path="/vs/ipqualityscore" element={<StaticPage config={SEO_ROUTES.vsIpqualityscore} bannerCmd="./compare --vs=ipqualityscore" bannerStatus="COMPARISON" />} />
                        <Route path="/vs/maxmind" element={<StaticPage config={SEO_ROUTES.vsMaxmind} bannerCmd="./compare --vs=maxmind" bannerStatus="COMPARISON" />} />
                        <Route path="/vs/sift" element={<StaticPage config={SEO_ROUTES.vsSift} bannerCmd="./compare --vs=sift" bannerStatus="COMPARISON" />} />
                        <Route path="/vs/cloudflare-turnstile" element={<StaticPage config={SEO_ROUTES.vsTurnstile} bannerCmd="./compare --vs=turnstile" bannerStatus="COMPARISON" />} />

                        {/* ═══ USE-CASE PAGES (long-tail, high buyer intent) ═══════════════ */}
                        <Route path="/use-cases/indie-hackers" element={<StaticPage config={SEO_ROUTES.useIndieHackers} bannerCmd="./use-case --for=indie-hackers" bannerStatus="USE CASE" />} />
                        <Route path="/use-cases/saas-startups" element={<StaticPage config={SEO_ROUTES.useSaasStartups} bannerCmd="./use-case --for=saas-startups" bannerStatus="USE CASE" />} />
                        <Route path="/use-cases/ecommerce" element={<StaticPage config={SEO_ROUTES.useEcommerce} bannerCmd="./use-case --for=ecommerce" bannerStatus="USE CASE" />} />

                        {/* ═══ INTEGRATIONS PAGE ════════════════════════════════════════════ */}
                        <Route path="/integrations" element={<StaticPage config={SEO_ROUTES.integrations} bannerCmd="./integrations --list" bannerStatus="DOCS" />} />

                        {/* ═══ CHANGELOG ════════════════════════════════════════════════════ */}
                        <Route path="/changelog" element={<StaticPage config={SEO_ROUTES.changelog} bannerCmd="./changelog --read" bannerStatus="RELEASE NOTES" />} />

            {/* ═══ AUTHOR PAGE (E-E-A-T) ════════════════════════════════════════ */}
            <Route path="/author/jeffrin-james" element={<Author />} />

            {/* ═══ TOPICS HUB (pillar content) ═════════════════════════════════ */}
            <Route path="/topics" element={<Topics />} />

            {/* ═══ FREE TOOL: DISPOSABLE EMAIL CHECKER ═══════════════════════════ */}
            <Route path="/disposable-checker" element={<DisposableChecker config={SEO_ROUTES.disposableChecker} />} />

            {/* ═══ GLOSSARY (educational pillar) ═════════════════════════════════ */}
            <Route path="/glossary" element={<Glossary />} />

            {/* ═══ ALTERNATIVES HUB + PER-TOOL PAGES ═════════════════════════════ */}
            <Route path="/alternatives" element={<Alternatives />} />
            <Route path="/alternatives/:slug" element={<Alternatives />} />

            {/* ═══ NEW LANDING PAGES (P0 keyword targets) ═══════════════════════ */}
            <Route path="/pay-per-call" element={<PayPerCall />} />
            <Route path="/fraud-detection-api-for-saas" element={<FraudApiForSaas />} />
            <Route path="/free-email-verification" element={<FreeEmailVerification />} />
          </Routes>
        </Suspense>
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