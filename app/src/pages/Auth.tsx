import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';

export default function Auth() {
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
