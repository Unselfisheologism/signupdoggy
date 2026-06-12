import { Link } from 'react-router-dom';

export default function Pricing() {
  return (
    <div className="section">
      <h1 className="section-title">Simple pricing. Pay for what you use.</h1>
      <p className="section-sub">
        No tiers. No minimums. No contracts. Every request costs the same.
      </p>
      <div className="pricing-grid">
        <div className="pricing-card featured">
          <h3>Pay-as-you-go</h3>
          <div className="price">
            $0.01<span>/ request</span>
          </div>
          <ul>
            <li>No minimum — pay for what you use</li>
            <li>No tiers — every request is $0.01</li>
            <li>No commitment — cancel anytime</li>
            <li>No rate limits — 1 or 1M, same price</li>
            <li>All features included</li>
            <li>125k+ disposable domains</li>
            <li>VPN/Tor/proxy detection</li>
            <li>Custom blacklists</li>
            <li>Usage analytics dashboard</li>
          </ul>
          <Link to="/signup" className="btn btn-primary btn-block">
            Get Started →
          </Link>
        </div>
      </div>
      <div
        style={{
          maxWidth: '600px',
          margin: '3rem auto 0',
          color: 'var(--text2)',
          fontSize: '0.9rem',
        }}
      >
        <h3 style={{ color: 'var(--text)', marginBottom: '0.5rem' }}>
          Why this is cheaper than SignupGate
        </h3>
        <p>
          SignupGate charges <strong>$29/month minimum</strong> even if you only
          need 100 requests. At 1k requests, that's $29 — or{' '}
          <strong>$10 with SignupDoggy</strong>.
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          At 100k requests: SignupGate charges $99/month while SignupDoggy costs{' '}
          <strong>$1,000</strong> (still pay-as-you-go, no commitment). Choose
          based on your volume — we're built for anyone who hates minimums.
        </p>
        <table className="compare-table">
          <thead>
            <tr>
              <th>Volume</th>
              <th>SignupGate</th>
              <th>SignupDoggy</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1k req/mo</td>
              <td>$29</td>
              <td className="winner">$10</td>
            </tr>
            <tr>
              <td>10k req/mo</td>
              <td>$99</td>
              <td className="winner">$100</td>
            </tr>
            <tr>
              <td>100k req/mo</td>
              <td>$99</td>
              <td className="winner">$1,000</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="footer">
        <p>
          🛡️ <span>SignupDoggy</span> — Built on Cloudflare Workers. Powered by
          open data.
        </p>
      </div>
    </div>
  );
}
