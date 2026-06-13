import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../auth';
import AppLayout from '../components/AppLayout';
import { GoogleIcon } from '../components/OAuthIcons';
import { ArrowRightIcon } from '../components/icons';

type Provider = 'google';

interface ProviderMeta {
  id: Provider;
  label: string;
  cmd: string;
  icon: JSX.Element;
}

const providers: ProviderMeta[] = [
  { id: 'google', label: 'GOOGLE', cmd: 'google', icon: <GoogleIcon /> },
];

// Map pack IDs from the URL to the credit pack IDs in portal-api/src/index.ts
// (so that the existing Dodo checkout keeps working unchanged).
const packMap: Record<string, string> = {
  solo: 'starter',
  pro: 'growth',
  scale: 'pro',
};

export default function Auth() {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);
  const [error, setError] = useState('');
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next');
  const pack = params.get('pack');
  const isCheckout = next === 'checkout' && pack;
  const packInternal = pack ? (packMap[pack] ?? 'starter') : null;
  const packPrice = pack === 'solo' ? 5 : pack === 'pro' ? 25 : pack === 'scale' ? 100 : null;
  const packRequests = pack === 'solo' ? '1,000' : pack === 'pro' ? '5,000' : pack === 'scale' ? '25,000' : null;

  useEffect(() => {
    if (!loading && user) {
      // Already signed in — send them straight to checkout if that's where
      // they were headed. Otherwise the dashboard.
      if (isCheckout && packInternal) {
        navigate(`/checkout?pack=${packInternal}`, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, loading, navigate, isCheckout, packInternal]);

  const signInWithProvider = async (provider: Provider) => {
    setError('');
    setLoadingProvider(provider);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin + '/auth' + (isCheckout && pack ? `?next=checkout&pack=${pack}` : ''),
      },
    });
    if (err) {
      setError(err.message);
      setLoadingProvider(null);
    }
  };

  return (
    <AppLayout>
      <div className="page-content" style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="term-banner" style={{ marginBottom: 'var(--space-xl)' }}>
          <span className="banner-prompt">$</span> {isCheckout ? `./checkout --pack=${pack}` : './auth'}
          <span className="banner-status">● {isCheckout ? 'BUY' : 'ACCESS'}</span>
        </div>

        <div className="auth-form-wrap">
          {isCheckout ? (
            <>
              <h1 className="auth-form-title">BUY {String(pack).toUpperCase()}: ${packPrice}</h1>
              <p className="auth-form-sub">
                {packRequests} API REQUESTS · ONE-TIME · NEVER EXPIRES
              </p>
              <p className="docs-p" style={{ marginBottom: 'var(--space-lg)' }}>
                SIGN IN OR CREATE AN ACCOUNT TO CONTINUE. NO CARD ON FILE UNTIL YOU CHECKOUT.
              </p>
            </>
          ) : (
            <>
              <h1 className="auth-form-title">GET MY API KEY</h1>
              <p className="auth-form-sub">PAYPAL IS A NON-CONCEPT. PAY ONCE, USE FOREVER.</p>
            </>
          )}

          {error && <div className="error-msg retro-error">! {error}</div>}

          <div className="oauth-section">
            <div className="oauth-section-label">
              <span className="prompt">$</span> ./continue-with
            </div>
            <div className="oauth-grid">
              {providers.map((p) => {
                const isLoading = loadingProvider === p.id;
                const isDisabled = loadingProvider !== null;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`oauth-btn${isLoading ? ' oauth-btn--loading' : ''}`}
                    onClick={() => signInWithProvider(p.id)}
                    disabled={isDisabled}
                    aria-label={`Continue with ${p.label}`}
                  >
                    <span className="oauth-btn-icon">{p.icon}</span>
                    <span className="oauth-btn-label">
                      {isLoading ? 'CONNECTING...' : `./login --provider=${p.cmd}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="auth-form-divider">
            <span>── OR USE EMAIL ──</span>
          </div>

          <div className="auth-chooser">
            {isCheckout ? (
              <Link to={`/signup?next=checkout&pack=${pack}`} className="auth-chooser-card auth-chooser-card--primary">
                <span className="auth-chooser-tag">NEW HERE</span>
                <span className="auth-chooser-title">CREATE ACCOUNT</span>
                <span className="auth-chooser-desc">30 seconds. Then you buy {packRequests} requests for ${packPrice}.</span>
                <span className="auth-chooser-cta">
                  <span className="prompt">$</span> ./create-account <ArrowRightIcon style={{ verticalAlign: '-2px', marginLeft: 2 }} />
                </span>
              </Link>
            ) : (
              <Link to="/signup" className="auth-chooser-card auth-chooser-card--primary">
                <span className="auth-chooser-tag">NEW HERE</span>
                <span className="auth-chooser-title">CREATE ACCOUNT</span>
                <span className="auth-chooser-desc">30 seconds. Then you buy credits and get an API key.</span>
                <span className="auth-chooser-cta">
                  <span className="prompt">$</span> ./create-account <ArrowRightIcon style={{ verticalAlign: '-2px', marginLeft: 2 }} />
                </span>
              </Link>
            )}

            <Link to={`/login${isCheckout && pack ? `?next=checkout&pack=${pack}` : ''}`} className="auth-chooser-card">
              <span className="auth-chooser-tag">RETURNING</span>
              <span className="auth-chooser-title">LOG IN</span>
              <span className="auth-chooser-desc">Already have an account? Pick up where you left off.</span>
              <span className="auth-chooser-cta">
                <span className="prompt">&gt;</span> ./login <ArrowRightIcon style={{ verticalAlign: '-2px', marginLeft: 2 }} />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
