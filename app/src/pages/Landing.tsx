import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';

export default function Landing() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'curl' | 'node' | 'python'>('curl');

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

  const codeMap = { curl: curlCmd, node: nodeExample, python: pyExample };

  const features = [
    {
      icon: '📧',
      title: 'Disposable Email Detection',
      desc: '125k+ known disposable email domains checked in O(1) time. Including wildcard subdomain matching for catch-all temp mail domains.',
    },
    {
      icon: '🔒',
      title: 'VPN & Proxy Detection',
      desc: 'Detect Tor exit nodes, VPNs, and hosting provider IPs (AWS, DigitalOcean, GCP, Azure, and 100+ more). Heuristic scoring gives you a 0–100 risk score.',
    },
    {
      icon: '📊',
      title: 'Custom Blacklists',
      desc: 'Block specific emails or IPs with your own blacklist. Per-user lists checked before global data — your rules always come first.',
    },
    {
      icon: '⚡',
      title: 'Edge Global',
      desc: 'Deployed on Cloudflare\'s global network. Average response time under 50ms p95. Auto-scales to any volume with zero warm-up.',
    },
    {
      icon: '💰',
      title: 'Pay-as-you-go',
      desc: '$0.01 per request. No minimums. No tiers. No surprise bills. Your key works for 1 request or 1 million — same price either way.',
    },
    {
      icon: '🔌',
      title: 'Zero Integration Friction',
      desc: 'Copy a cURL command and you\'re done. Node.js and Python snippets ready in the docs. No SDK install required — just an HTTP call.',
    },
  ];

  return (
    <>
      {/* Nav is hidden on landing — rendered via App.tsx logic */}
      <div className="hero">
        <div className="hero-badge">
          <span className="dot" />
          Now in public beta
        </div>
        <h1>
          Stop fake signups in{' '}
          <span className="highlight">5 minutes</span>
        </h1>
        <p>
          One API call detects disposable emails, VPNs, Tor exit nodes, and
          hosting IPs. Built for indie hackers. Priced for startups. Powered by
          open data.
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
        <p className="section-sub">
          One POST request tells you everything you need to know about a signup.
        </p>
        <div className="features">
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">One API call. Instant result.</h2>
        <p className="section-sub">
          Paste this into your terminal — you'll get a response in under 50ms.
        </p>
        <div className="code-showcase">
          <div className="code-tabs">
            <span
              className={'code-tab' + (activeTab === 'curl' ? ' active' : '')}
              onClick={() => setActiveTab('curl')}
            >
              cURL
            </span>
            <span
              className={'code-tab' + (activeTab === 'node' ? ' active' : '')}
              onClick={() => setActiveTab('node')}
            >
              Node.js
            </span>
            <span
              className={
                'code-tab' + (activeTab === 'python' ? ' active' : '')
              }
              onClick={() => setActiveTab('python')}
            >
              Python
            </span>
          </div>
          <div className="pre-group">
            <pre>
              <code>{codeMap[activeTab]}</code>
              <button
                className="copy-btn"
                onClick={() =>
                  navigator.clipboard.writeText(codeMap[activeTab])
                }
              >
                Copy
              </button>
            </pre>
            {activeTab === 'curl' && (
              <pre>
                <code>{jsonResp}</code>
                <button
                  className="copy-btn"
                  onClick={() => navigator.clipboard.writeText(jsonResp)}
                >
                  Copy
                </button>
              </pre>
            )}
          </div>
        </div>
      </div>

      <div className="footer">
        <p>
          🛡️ <span>SignupDoggy</span> — Built on Cloudflare Workers. Powered by
          open data.
        </p>
      </div>
    </>
  );
}
