import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../auth';
import AppLayout from '../components/AppLayout';
import {
  GoogleIcon,
  GithubIcon,
  DiscordIcon,
  XIcon,
  FacebookIcon,
} from '../components/OAuthIcons';

// Keep the SDK provider keys in one place so we can grep them later.
type Provider = 'google' | 'github' | 'discord' | 'twitter' | 'facebook';

interface ProviderMeta {
  id: Provider;
  label: string;
  cmd: string;
  icon: JSX.Element;
}

const providers: ProviderMeta[] = [
  { id: 'google',   label: 'GOOGLE',   cmd: 'google',   icon: <GoogleIcon /> },
  { id: 'github',   label: 'GITHUB',   cmd: 'github',   icon: <GithubIcon /> },
  { id: 'discord',  label: 'DISCORD',  cmd: 'discord',  icon: <DiscordIcon /> },
  { id: 'twitter',  label: 'X / TWITTER (OAUTH 2.0)', cmd: 'twitter', icon: <XIcon /> },
  { id: 'facebook', label: 'FACEBOOK', cmd: 'facebook', icon: <FacebookIcon /> },
];

export default function Auth() {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);
  const [error, setError] = useState('');
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // If a session already exists (e.g. user just returned from an OAuth flow
  // and Supabase processed the URL fragment), bounce straight to the dashboard.
  useEffect(() => {
    if (!loading && user) navigate('/dashboard', { replace: true });
  }, [user, loading, navigate]);

  const signInWithProvider = async (provider: Provider) => {
    setError('');
    setLoadingProvider(provider);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        // Supabase redirects back here with the session in the URL fragment;
        // the AuthProvider listener picks it up and the useEffect above sends
        // the user to /dashboard.
        redirectTo: window.location.origin + '/auth',
      },
    });
    if (err) {
      setError(err.message);
      setLoadingProvider(null);
    }
    // On success the browser navigates away, so we intentionally don't reset
    // loadingProvider — the page will be replaced.
  };

  return (
    <AppLayout title="auth.signupdoggy.pages.dev">
      <div className="page-content" style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="term-banner" style={{ marginBottom: 'var(--space-xl)' }}>
          <span className="banner-prompt">$</span> ./auth
          <span className="banner-status">● ACCESS</span>
        </div>

        <div className="auth-form-wrap">
          <h1 className="auth-form-title">GET STARTED WITH SIGNUPDOGGY</h1>
          <p className="auth-form-sub">FREE TIER INCLUDES 1,000 REQUESTS / DAY · NO CREDIT CARD</p>

          {error && <div className="error-msg retro-error">! {error}</div>}

          {/* OAuth providers — single-click sign-in or sign-up */}
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
            <Link to="/signup" className="auth-chooser-card auth-chooser-card--primary">
              <span className="auth-chooser-tag">NEW HERE</span>
              <span className="auth-chooser-title">CREATE ACCOUNT</span>
              <span className="auth-chooser-desc">Start free. No credit card. 1,000 requests/day on the house.</span>
              <span className="auth-chooser-cta">
                <span className="prompt">$</span> ./create-account →
              </span>
            </Link>

            <Link to="/login" className="auth-chooser-card">
              <span className="auth-chooser-tag">RETURNING</span>
              <span className="auth-chooser-title">LOG IN</span>
              <span className="auth-chooser-desc">Already have an account? Pick up where you left off.</span>
              <span className="auth-chooser-cta">
                <span className="prompt">&gt;</span> ./login →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
