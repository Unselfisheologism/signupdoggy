import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';
import AppLayout from '../components/AppLayout';

const packMap: Record<string, string> = {
  solo: 'starter',
  pro: 'growth',
  scale: 'pro',
};

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next');
  const pack = params.get('pack');
  const packInternal = pack ? (packMap[pack] ?? null) : null;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error: authErr } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (authErr) { setError(authErr.message); return; }
    if (next === 'checkout' && packInternal) {
      navigate(`/checkout?pack=${packInternal}`, { replace: true });
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <AppLayout>
      <div className="page-content" style={{ maxWidth: 440, margin: '0 auto' }}>
        <div className="term-banner" style={{ marginBottom: 'var(--space-xl)' }}>
          <span className="banner-prompt">$</span> {next === 'checkout' && pack ? `./signup --pack=${pack}` : './signup'}
        </div>

        <div className="auth-form-wrap">
          <h1 className="auth-form-title">CREATE YOUR ACCOUNT</h1>
          <p className="auth-form-sub">
            {next === 'checkout' && pack
              ? `30 SECONDS. THEN YOU BUY ${String(pack).toUpperCase()}.`
              : '30 SECONDS. THEN YOU BUY CREDITS.'}
          </p>

          {error && <div className="error-msg retro-error">! {error}</div>}

          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">EMAIL</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password" className="form-label">PASSWORD</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              className="btn-terminal btn-terminal--full"
              disabled={loading}
            >
              <span className="prompt">$</span>
              {loading ? './creating-account...' : './create-account'}
            </button>
          </form>

          <div className="auth-form-footer">
            <span className="auth-form-divider">──</span>
            <span>ALREADY HAVE ONE? <Link to={`/login${next === 'checkout' && pack ? `?next=checkout&pack=${pack}` : ''}`} className="auth-form-link">LOG IN</Link></span>
            <span className="auth-form-divider">──</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
