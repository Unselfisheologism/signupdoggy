import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';

const curlCmd = `curl -X POST https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check \\\\
  -H "x-api-key: sd_your_key_here" \\\\
  -H "Content-Type: application/json" \\\\
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
    <div className="landing-wrapper">
      {/* ═══ BOLD CRT EFFECTS ═══ */}
      <div className="crt-overlay" />
      <div className="scanlines" />

      {/* ═══ HERO ═══ */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-dotgrid" />
        <div className="hero-grain" />

          <div className="hero-grid">
            {/* Left */}
            <div className="hero-content">
              <div className="hero-badge">
                <span className="badge-dot" />
                NOW IN PUBLIC BETA
              </div>

              <h1 className="hero-h1">
                Stop fake signups in{' '}
                <span className="highlight">5 minutes</span>
              </h1>

              <p className="hero-p">
                One API call detects disposable emails, VPNs, Tor exit nodes,
                and hosting IPs. Built for indie hackers. Priced for startups.
                Powered by open data.
              </p>

              <div className="hero-actions">
                <Link
                  to={user ? '/dashboard' : '/signup'}
                  className="btn btn-primary"
                >
                  Get Started Free →
                </Link>
                <Link to="/docs" className="btn btn-outline">
                  Read the Docs
                </Link>
              </div>

              <div className="hero-stats">
                <div className="hero-stat">
                  <div className="num">50ms</div>
                  <div className="label">RESPONSE TIME P95</div>
                </div>
                <div className="hero-stat">
                  <div className="num">$0.01</div>
                  <div className="label">PER REQUEST</div>
                </div>
                <div className="hero-stat">
                  <div className="num">125k</div>
                  <div className="label">BLOCKED DOMAINS</div>
                </div>
              </div>
            </div>

            {/* Right - Terminal */}
            <div className="hero-visual">
              <div className="hero-terminal">
                <div className="terminal-header">
                  <div className="terminal-dots">
                    <span className="terminal-dot red" />
                    <span className="terminal-dot yellow" />
                    <span className="terminal-dot green" />
                  </div>
                  <span className="terminal-title">api-check.sh — bash</span>
                </div>
                <div className="terminal-body">
                  <span className="line-prompt">$</span>{' '}
                  <span className="line-cmd">curl</span> -X POST https://signupdoggy-api<br />
                  <span className="indent">
                    <span className="line-key">-H</span>{' '}
                    <span className="line-str">"x-api-key: sd_your_key_here"</span>
                  </span><br />
                  <span className="indent">
                    <span className="line-key">-H</span>{' '}
                    <span className="line-str">"Content-Type: application/json"</span>
                  </span><br />
                  <span className="indent">
                    <span className="line-key">-d</span>{' '}
                    <span className="line-str">{'{"email":"user@example.com","ip":"1.2.3.4"}'}</span>
                  </span><br />
                  <br />
                  <span className="line-comment"># → 50ms later...</span><br />
                  <span className="line-res">{'{'}</span><br />
                  <span className="indent line-res">"recommendation": </span>
                  <span className="line-str">"allow"</span><span className="line-res">,</span><br />
                  <span className="indent line-res">"overall_risk": </span>
                  <span className="line-str">"low"</span><br />
                  <span className="line-res">{'}'}</span>
                  <span className="terminal-cursor" />
                </div>
              </div>
            </div>
          </div>
      </section>

      {/* TRUST BAR */}
      <section className="trust-bar">
        <div className="trust-label">TRUSTED BY ENGINEERING TEAMS AT</div>
        <div className="trust-logos">
          <span className="trust-logo">
            <img
              src="https://cdn.simpleicons.org/stripe/ffffff"
              alt="Stripe"
              height="20"
              style={{ verticalAlign: 'middle' }}
            />
          </span>
          <span className="trust-logo">
            <img
              src="https://cdn.simpleicons.org/supabase/ffffff"
              alt="Supabase"
              height="20"
              style={{ verticalAlign: 'middle' }}
            />
          </span>
          <span className="trust-logo">
            <img
              src="https://cdn.simpleicons.org/linear/ffffff"
              alt="Linear"
              height="20"
              style={{ verticalAlign: 'middle' }}
            />
          </span>
          <span className="trust-logo">
            <img
              src="https://cdn.simpleicons.org/vercel/ffffff"
              alt="Vercel"
              height="18"
              style={{ verticalAlign: 'middle' }}
            />
          </span>
          <span className="trust-logo">
            <img
              src="https://cdn.simpleicons.org/cloudflare/ffffff"
              alt="Cloudflare"
              height="20"
              style={{ verticalAlign: 'middle' }}
            />
          </span>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <div className="section-header">
          <span className="section-tag">FEATURES</span>
          <h2 className="section-title">What you get</h2>
          <p className="section-sub">
            Fraud detection that works out of the box. No model training,
            no complex rules, no monthly minimums.
          </p>
        </div>

        <div className="features">
          <div className="feature-card">
            <div className="feature-icon">📧</div>
            <h3>Disposable Email Detection</h3>
            <p>
              125k+ known disposable domains checked in O(1) time. Wildcard
              subdomain matching catches catch-all temp mail domains.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>VPN &amp; Proxy Detection</h3>
            <p>
              Tor exit nodes, VPNs, and hosting provider IPs from AWS,
              DigitalOcean, GCP, Azure and 100+ more providers.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Pay as you go</h3>
            <p>
              $0.01 per request. No minimums, no tiers, no surprise bills.
              Free tier gives you 1,000 requests per day.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Zero integration friction</h3>
            <p>
              Copy a cURL command and you are done. Node.js and Python
              snippets ready in the docs. No SDK install required.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>Custom Blacklists</h3>
            <p>
              Block specific emails or IPs with your own rules. Your
              blacklist is checked before global data.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>Edge Global</h3>
            <p>
              Deployed on Cloudflare's global network. Average response
              time under 50ms p95. Scales to any volume.
            </p>
          </div>
        </div>
      </section>

      {/* CODE SHOWCASE */}
      <section className="section">
        <div className="section-header centered">
          <span className="section-tag">TRY IT</span>
          <h2 className="section-title">One API call. Instant result.</h2>
          <p className="section-sub">
            Paste this into your terminal. You'll get a response in under 50ms.
          </p>
        </div>

        <div className="code-showcase">
          <div className="code-tabs">
            <span
              className={'code-tab' + (tab === 'curl' ? ' active' : '')}
              onClick={() => setTab('curl')}
            >
              cURL
            </span>
            <span
              className={'code-tab' + (tab === 'node' ? ' active' : '')}
              onClick={() => setTab('node')}
            >
              Node.js
            </span>
            <span
              className={'code-tab' + (tab === 'python' ? ' active' : '')}
              onClick={() => setTab('python')}
            >
              Python
            </span>
          </div>

          <div className="pre-group">
            <pre>
              <code>{codeMap[tab]}</code>
            </pre>
            <button
              className="copy-btn"
              onClick={() => navigator.clipboard.writeText(codeMap[tab])}
            >
              Copy
            </button>
          </div>

          {tab === 'curl' && (
            <div className="pre-group" style={{ borderTop: '1px solid rgba(255,107,53,0.06)' }}>
              <pre>
                <code>{jsonResp}</code>
              </pre>
              <button
                className="copy-btn"
                onClick={() => navigator.clipboard.writeText(jsonResp)}
              >
                Copy
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2>Ready to stop fake signups?</h2>
          <p>
            No sales call. No credit card. Just a single API key and a
            curl command. Start protecting your app in under 5 minutes.
          </p>
          <div className="cta-actions">
            <Link
              to={user ? '/dashboard' : '/signup'}
              className="btn btn-primary"
            >
              Get Started Free →
            </Link>
            <Link to="/pricing" className="btn btn-outline">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div>
            <span className="footer-brand">SignupDoggy</span>
            <span className="footer-text">
              Built on Cloudflare Workers. Powered by open data.
            </span>
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
