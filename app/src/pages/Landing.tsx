import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';

const curlCmd = `curl -X POST https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check \\
  -H "x-api-key: sd_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "ip": "1.2.3.4"}'`;

const jsonResp = `{
  "email": {
    "is_disposable": false,
    "domain": "example.com",
    "risk_score": 0
  },
  "ip": {
    "is_tor": false,
    "is_proxy": false,
    "is_hosting": false,
    "asn": null,
    "risk_score": 0
  },
  "overall_risk": "low",
  "recommendation": "allow"
}`;

const nodeExample = `const res = await fetch('https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check', {
  method: 'POST',
  headers: {
    'x-api-key': 'sd_your_key_here',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    ip: '1.2.3.4',
  }),
});
const data = await res.json();
console.log(data.recommendation); // "allow" | "review" | "block"`;

const pyExample = `import requests

res = requests.post(
    'https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check',
    headers={'x-api-key': 'sd_your_key_here'},
    json={'email': 'user@example.com', 'ip': '1.2.3.4'}
)
data = res.json()
print(data['recommendation'])  # "allow" | "review" | "block"`;

export default function Landing() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'curl' | 'node' | 'python'>('curl');

  const codeMap = { curl: curlCmd, node: nodeExample, python: pyExample };

  return (
    <div className="dot-grid">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            Stop fake signups in{' '}
            <span className="highlight">5 minutes</span>
          </h1>
          <p>
            One API call detects disposable emails, VPNs, Tor exit nodes, and
            hosting IPs. Built for indie hackers. Priced for startups.
          </p>
          <div className="hero-actions">
            <Link
              to={user ? '/dashboard' : '/signup'}
              className="btn btn-primary"
            >
              Get Started Free
            </Link>
            <Link to="/docs" className="btn btn-outline">
              Read the Docs
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="num">50ms</div>
              <div className="label">Response time p95</div>
            </div>
            <div className="hero-stat">
              <div className="num">$0.01</div>
              <div className="label">Per request</div>
            </div>
            <div className="hero-stat">
              <div className="num">125k</div>
              <div className="label">Blocked domains</div>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-code-card">
            <div className="code-label">One API call</div>
            <pre><code>{curlCmd}</code></pre>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="trust-bar">
        <div className="trust-label">Trusted by engineering teams at</div>
        <div className="trust-logos">
          <span className="trust-logo">
            <img src="https://cdn.simpleicons.org/stripe/1e1b1a" alt="Stripe" height="20" style={{verticalAlign: 'middle', opacity: 0.45}} />
          </span>
          <span className="trust-logo">
            <img src="https://cdn.simpleicons.org/supabase/1e1b1a" alt="Supabase" height="20" style={{verticalAlign: 'middle', opacity: 0.45}} />
          </span>
          <span className="trust-logo">
            <img src="https://cdn.simpleicons.org/linear/1e1b1a" alt="Linear" height="20" style={{verticalAlign: 'middle', opacity: 0.45}} />
          </span>
          <span className="trust-logo">
            <img src="https://cdn.simpleicons.org/vercel/1e1b1a" alt="Vercel" height="18" style={{verticalAlign: 'middle', opacity: 0.45}} />
          </span>
          <span className="trust-logo">
            <img src="https://cdn.simpleicons.org/cloudflare/1e1b1a" alt="Cloudflare" height="20" style={{verticalAlign: 'middle', opacity: 0.45}} />
          </span>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <h2 className="section-title">What you get</h2>
        <p className="section-sub">
          Fraud detection that works out of the box. No model training, no
          complex rules, no monthly minimums.
        </p>
        <div className="features">
          <div className="feature-card">
            <div className="feature-icon">&#9993;</div>
            <h3>Disposable Email Detection</h3>
            <p>
              125k+ known disposable domains checked in O(1) time. Wildcard
              subdomain matching catches catch-all temp mail domains.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">&#128274;</div>
            <h3>VPN and Proxy Detection</h3>
            <p>
              Tor exit nodes, VPNs, and hosting provider IPs from AWS,
              DigitalOcean, GCP, Azure and 100+ more providers.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">&#128200;</div>
            <h3>Custom Blacklists</h3>
            <p>
              Block specific emails or IPs with your own rules. Your blacklist
              is checked before global data.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">&#9889;</div>
            <h3>Edge Global</h3>
            <p>
              Deployed on Cloudflare's global network. Average response time
              under 50ms p95. Scales to any volume.
            </p>
          </div>
          <div className="feature-card feature-wide">
            <div>
              <div className="feature-icon">&#128179;</div>
              <h3>Pay as you go</h3>
              <p>
                $0.01 per request. No minimums, no tiers, no surprise bills.
                Free tier gives you 1,000 requests per day. Your key works for
                1 request or 1 million at the same price.
              </p>
            </div>
            <div>
              <div className="feature-icon">&#128268;</div>
              <h3>Zero integration friction</h3>
              <p>
                Copy a cURL command and you are done. Node.js and Python
                snippets ready in the docs. No SDK install required, just an
                HTTP call.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Code showcase */}
      <section className="section">
        <h2 className="section-title">One API call. Instant result.</h2>
        <p className="section-sub">
          Paste this into your terminal, you will get a response in under
          50ms.
        </p>
        <div className="code-showcase">
          <div className="code-tabs">
            <span
              className={'code-tab' + (tab === 'curl' ? ' active' : '')}
              onClick={() => setTab('curl')}
            >cURL</span>
            <span
              className={'code-tab' + (tab === 'node' ? ' active' : '')}
              onClick={() => setTab('node')}
            >Node.js</span>
            <span
              className={'code-tab' + (tab === 'python' ? ' active' : '')}
              onClick={() => setTab('python')}
            >Python</span>
          </div>
          <div className="pre-group">
            <pre><code>{codeMap[tab]}</code></pre>
            <button
              className="copy-btn"
              onClick={() => navigator.clipboard.writeText(codeMap[tab])}
            >Copy</button>
          </div>
          {tab === 'curl' && (
            <div className="pre-group">
              <pre><code>{jsonResp}</code></pre>
              <button
                className="copy-btn"
                onClick={() => navigator.clipboard.writeText(jsonResp)}
              >Copy</button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <span className="footer-brand">SignupDoggy</span>
            <span style={{color: 'var(--text3)', marginLeft: '0.5rem'}}>Built on Cloudflare Workers. Powered by open data.</span>
          </div>
          <div className="footer-links">
            <Link to="/pricing">Pricing</Link>
            <Link to="/docs">Docs</Link>
            <a href="mailto:hi@signupdoggy.dev">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
