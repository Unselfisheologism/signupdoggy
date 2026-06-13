import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../auth';
import AppLayout from '../components/AppLayout';
import { ArrowRightIcon } from '../components/icons';
import { supabase } from '../supabase';

const API = 'https://signupdoggy-portal-api.jeffrinjames99.workers.dev';

const packMeta: Record<string, { label: string; amount: number; requests: string; perReq: string }> = {
  starter: { label: 'SOLO', amount: 5, requests: '1,000 REQUESTS', perReq: '$0.005 / REQ' },
  growth: { label: 'PRO', amount: 25, requests: '5,000 REQUESTS', perReq: '$0.005 / REQ' },
  pro: { label: 'SCALE', amount: 100, requests: '25,000 REQUESTS', perReq: '$0.004 / REQ' },
};

export default function Checkout() {
  const { user, loading } = useAuth();
  const [params] = useSearchParams();
  const pack = params.get('pack') || 'starter';
  const meta = packMeta[pack] || packMeta.starter;
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate(`/auth?next=checkout&pack=${pack === 'starter' ? 'solo' : pack === 'growth' ? 'pro' : 'scale'}`, { replace: true });
    }
  }, [user, loading, navigate, pack]);

  async function buy() {
    if (!user) return;
    setBusy(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Not authenticated');
      const res = await fetch(`${API}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ pack, return_url: window.location.origin + '/dashboard?welcome=1' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      // Redirect to Dodo Payments checkout URL
      window.location.href = data.checkout_url || data.session_id;
    } catch (err: any) {
      setError(err?.message || 'Could not start checkout.');
      setBusy(false);
    }
  }

  return (
    <AppLayout>
      <div className="page-content" style={{ maxWidth: 540, margin: '0 auto' }}>
        <div className="term-banner">
          <span className="banner-prompt">$</span> ./checkout --pack={pack}
          <span className="banner-status">● ONE-TIME PAYMENT</span>
        </div>

        <h1 className="docs-h1">CHECKOUT</h1>
        <p className="docs-lead">
          ONE PAYMENT. NEVER EXPIRES. NO MONTHLY FEE. NO SUBSCRIPTION.
        </p>

        <div className="checkout-summary">
          <div className="checkout-line">
            <span className="checkout-label">PACK</span>
            <span className="checkout-val">{meta.label}</span>
          </div>
          <div className="checkout-line">
            <span className="checkout-label">REQUESTS</span>
            <span className="checkout-val">{meta.requests}</span>
          </div>
          <div className="checkout-line">
            <span className="checkout-label">PER REQUEST</span>
            <span className="checkout-val">{meta.perReq}</span>
          </div>
          <div className="checkout-line checkout-line--big">
            <span className="checkout-label">TOTAL (ONE-TIME)</span>
            <span className="checkout-val">${meta.amount}</span>
          </div>
        </div>

        {error && <div className="error-msg retro-error">! {error}</div>}

        <button
          className="btn-terminal btn-terminal--full"
          onClick={buy}
          disabled={busy}
          style={{ marginTop: 'var(--space-lg)' }}
        >
          <span className="prompt">$</span>
          {busy ? './redirecting-to-dodo...' : `./pay-$${meta.amount}-now`}
          {!busy && <ArrowRightIcon />}
        </button>

        <div className="checkout-fine">
          <p>PAYMENT PROCESSED BY DODO PAYMENTS. WE NEVER SEE YOUR CARD.</p>
          <p>AFTER PAYMENT YOU GET AN API KEY INSTANTLY. NO MANUAL APPROVAL.</p>
          <p>NOT HAPPY? EMAIL <a href="mailto:jeffrinjames99@gmail.com">JEFFRINJAMES99@GMAIL.COM</a> AND I&apos;LL REFUND YOU PERSONALLY.</p>
        </div>

        <div className="auth-form-footer">
          <span className="auth-form-divider">──</span>
          <span>WANT A DIFFERENT SIZE? <Link to="/pricing">SEE ALL THREE</Link></span>
          <span className="auth-form-divider">──</span>
        </div>
      </div>
    </AppLayout>
  );
}
