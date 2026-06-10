import { Link } from 'react-router-dom';
import { useAuth } from '../auth';

export default function Landing() {
  const { user } = useAuth();

  const curlCmd = [
    'curl -X POST https://registerguardian-api.jeffrinjames99.workers.dev/v1/check \\',
    '  -H "x-api-key: rg_your_key_here" \\',
    '  -H "Content-Type: application/json" \\',
    "  -d '{\"email\": \"user@example.com\", \"ip\": \"1.2.3.4\"}'",
  ].join('\n');

  const jsonResp = [
    '{',
    '  "email": {',
    '    "is_disposable": false,',
    '    "domain": "example.com",',
    '    "risk_score": 0',
    '  },',
    '  "ip": {',
    '    "is_tor": false,',
    '    "is_proxy": false,',
    '    "is_hosting": false,',
    '    "asn": null,',
    '    "risk_score": 0',
    '  },',
    '  "overall_risk": "low",',
    '  "recommendation": "allow"',
    '}',
  ].join('\n');

  return (
    <>
      <nav className="navbar">
        <div className="nav-inner">
          <Link to="/" className="nav-logo">🛡️ RegisterGuardian</Link>
          <div className="nav-links">
            <Link to="/pricing">Pricing</Link>
            <Link to="/docs">Docs</Link>
            {user ? (
              <Link to="/dashboard" className="btn btn-sm btn-primary">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-sm">Log in</Link>
                <Link to="/signup" className="btn btn-sm btn-primary">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="hero">
        <h1>Stop fake signups in <span>5 minutes</span></h1>
        <p>One API call detects disposable emails, VPNs, Tor exit nodes, and hosting IPs. Built for indie hackers. Priced for startups. Powered by open data.</p>
        <div className="hero-actions">
          <Link to={user ? "/dashboard" : "/signup"} className="btn btn-primary">Get Started Free →</Link>
          <Link to="/docs" className="btn">Read the Docs</Link>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="num">&lt;50ms</div>
            <div className="label">Response time p95</div>
          </div>
          <div className="hero-stat">
            <div className="num">$0.01</div>
            <div className="label">Per request</div>
          </div>
          <div className="hero-stat">
            <div className="num">125k+</div>
            <div className="label">Blocked domains</div>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">How it works</h2>
        <p className="section-sub">One POST request tells you everything you need to know about a signup.</p>
        <div className="features">
          <div className="feature-card">
            <div className="icon">📧</div>
            <h3>Disposable Email Detection</h3>
            <p>125k+ known disposable email domains checked in O(1) time. Including wildcard subdomain matching for catch-all temp mail domains.</p>
          </div>
          <div className="feature-card">
            <div className="icon">🔒</div>
            <h3>VPN & Proxy Detection</h3>
            <p>Detect Tor exit nodes, VPNs, and hosting provider IPs (AWS, DigitalOcean, GCP, Azure, and 100+ more). Heuristic scoring gives you a 0-100 risk score.</p>
          </div>
          <div className="feature-card">
            <div className="icon">📊</div>
            <h3>Custom Blacklists</h3>
            <p>Block specific emails or IPs with your own blacklist. Per-user lists checked before global data — your rules always come first.</p>
          </div>
          <div className="feature-card">
            <div className="icon">⚡</div>
            <h3>Edge Global</h3>
            <p>Deployed on Cloudflare's global network. Average response time under 50ms p95. Auto-scales to any volume with zero warm-up.</p>
          </div>
          <div className="feature-card">
            <div className="icon">💰</div>
            <h3>Pay-as-you-go</h3>
            <p>$0.01 per request. No minimums. No tiers. No surprise bills. Your key works for 1 request or 1 million — same price either way.</p>
          </div>
          <div className="feature-card">
            <div className="icon">🔌</div>
            <h3>Zero Integration Friction</h3>
            <p>Copy a cURL command and you're done. Node.js and Python snippets ready in the docs. No SDK install required — just an HTTP call.</p>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">One API call. Instant result.</h2>
        <div className="features" style={{ gridTemplateColumns: '1fr' }}>
          <div className="feature-card">
            <pre><code>{curlCmd}</code></pre>
            <pre><code>{jsonResp}</code></pre>
          </div>
        </div>
      </div>

      <div className="footer">
        <p>🛡️ RegisterGuardian — Built on Cloudflare Workers. Powered by open data.</p>
      </div>
    </>
  );
}
