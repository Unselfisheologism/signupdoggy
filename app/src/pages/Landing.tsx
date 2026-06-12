import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';

const curlCmd = `curl -X POST https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check \\\\
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

/* SVG Icons */
const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="0" />
    <path d="M22 4L12 13L2 4" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L3 7v5c0 5.25 3.83 10.15 9 11 5.17-.85 9-5.75 9-11V7z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const DollarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M9 8.5c0-1 .8-1.5 1.8-1.5h2.4c1 0 1.8.7 1.8 1.7v.3c0 .9-.7 1.5-1.6 1.5H10" />
    <path d="M12 7v10" />
    <path d="M9 15.5c0 1 .8 1.5 1.8 1.5h2.4c1 0 1.8-.7 1.8-1.7v-.3c0-.9-.7-1.5-1.6-1.5H10" />
  </svg>
);

const ZapIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10" />
  </svg>
);

const ListIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);

const CodeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 3 21 7 16 12" />
    <polyline points="8 3 3 7 8 12" />
    <line x1="14" y1="3" x2="10" y2="21" />
  </svg>
);

const features = [
  {
    icon: <MailIcon />,
    title: 'Disposable Email Detection',
    desc: '125k+ known disposable domains checked in O(1) time. Wildcard subdomain matching catches catch-all temp mail domains.',
  },
  {
    icon: <ShieldIcon />,
    title: 'VPN & Proxy Detection',
    desc: 'Tor exit nodes, VPNs, and hosting provider IPs from AWS, DigitalOcean, GCP, Azure and 100+ more providers.',
  },
  {
    icon: <DollarIcon />,
    title: 'Pay as you go',
    desc: '$0.01 per request. No minimums, no tiers, no surprise bills. Free tier gives you 1,000 requests per day.',
  },
  {
    icon: <ZapIcon />,
    title: 'Zero integration friction',
    desc: 'Copy a cURL command and you\'re done. Node.js and Python snippets ready in the docs. No SDK install required.',
  },
  {
    icon: <ListIcon />,
    title: 'Custom Blacklists',
    desc: 'Block specific emails or IPs with your own rules. Your blacklist is checked before global data.',
  },
  {
    icon: <GlobeIcon />,
    title: 'Edge Global',
    desc: 'Deployed on Cloudflare\'s global network. Average response time under 50ms p95. Scales to any volume.',
  },
];

export default function Landing() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'curl' | 'node' | 'python'>('curl');
  const [copied, setCopied] = useState<string | null>(null);
  const codeMap = { curl: curlCmd, node: nodeExample, python: pyExample };

  return (
    <div className="landing-wrapper">
      {/* ═══ HERO ═══ */}
      <section className="hero">
        <div className="hero-grid">
          {/* Left */}
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot" />
              NOW IN PUBLIC BETA
            </div>

            <h1>
              Stop fake signups in{' '}
              <span className="highlight">5 minutes</span>
            </h1>

            <p>
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
                <div className="label">P95 response</div>
              </div>
              <div className="hero-stat">
                <div className="num">$0.01</div>
                <div className="label">per request</div>
              </div>
              <div className="hero-stat">
                <div className="num">125k</div>
                <div className="label">blocked domains</div>
              </div>
            </div>
          </div>

          {/* Right — Terminal */}
          <div className="hero-visual">
            <div className="hero-terminal">
              <div className="terminal-header">
                <div className="terminal-dots">
                  <span className="terminal-dot" />
                  <span className="terminal-dot" />
                  <span className="terminal-dot" />
                </div>
                <span className="terminal-title">api-check.sh — bash</span>
              </div>
              <div className="terminal-body">
                <span className="line-prompt">$</span>{' '}
                <span className="line-cmd">curl</span> -X POST https://signupdoggy-api<br />
                <span className="line-indent">
                  <span className="line-key">-H</span>{' '}
                  <span className="line-str">"x-api-key: sd_your_key_here"</span>
                </span><br />
                <span className="line-indent">
                  <span className="line-key">-H</span>{' '}
                  <span className="line-str">"Content-Type: application/json"</span>
                </span><br />
                <span className="line-indent">
                  <span className="line-key">-d</span>{' '}
                  <span className="line-str">{'{"email":"user@example.com","ip":"1.2.3.4"}'}</span>
                </span><br />
                <br />
                <span className="line-comment"># → 50ms later...</span><br />
                <span className="line-res">{'{'}</span><br />
                <span className="line-indent line-res">"recommendation": </span>
                <span className="line-str">"allow"</span><span className="line-res">,</span><br />
                <span className="line-indent line-res">"overall_risk": </span>
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
        <div className="trust-label">Trusted by engineering teams at</div>
        <div className="trust-logos">
          <span className="trust-logo">
            <img src="https://cdn.simpleicons.org/stripe/ffffff" alt="Stripe" height="20" />
          </span>
          <span className="trust-logo">
            <img src="https://cdn.simpleicons.org/supabase/ffffff" alt="Supabase" height="20" />
          </span>
          <span className="trust-logo">
            <img src="https://cdn.simpleicons.org/linear/ffffff" alt="Linear" height="20" />
          </span>
          <span className="trust-logo">
            <img src="https://cdn.simpleicons.org/vercel/ffffff" alt="Vercel" height="18" />
          </span>
          <span className="trust-logo">
            <img src="https://cdn.simpleicons.org/cloudflare/ffffff" alt="Cloudflare" height="20" />
          </span>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <div className="section-header">
          <span className="section-tag">Features</span>
          <h2 className="section-title">What you get</h2>
          <p className="section-sub">
            Fraud detection that works out of the box. No model training,
            no complex rules, no monthly minimums.
          </p>
        </div>

        <div className="features">
          {features.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CODE SHOWCASE */}
      <section className="section">
        <div className="section-header">
          <span className="section-tag">Try it</span>
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
              className={'copy-btn' + (copied === 'req' ? ' copied' : '')}
              onClick={() => {
                navigator.clipboard.writeText(codeMap[tab]);
                setCopied('req');
                setTimeout(() => setCopied(null), 1500);
              }}
            >
              {copied === 'req' ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {tab === 'curl' && (
            <div className="pre-group response-block">
              <pre>
                <code>{jsonResp}</code>
              </pre>
              <button
                className={'copy-btn' + (copied === 'res' ? ' copied' : '')}
                onClick={() => {
                  navigator.clipboard.writeText(jsonResp);
                  setCopied('res');
                  setTimeout(() => setCopied(null), 1500);
                }}
              >
                {copied === 'res' ? 'Copied!' : 'Copy'}
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
