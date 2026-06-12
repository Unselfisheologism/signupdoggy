import { Link } from 'react-router-dom';

export default function Pricing() {
  return (
    <div className="section">
      <h2 className="section-title">Simple pricing</h2>
      <p className="section-sub">
        1,000 requests per day free. Then $0.01 per request. No minimums, no
        tiers, no surprise bills.
      </p>

      <div className="pricing-grid">
        <div className="pricing-card featured">
          <h3>Pay as you go</h3>
          <p className="pricing-sub">One API key. Same price at every scale.</p>
          <div className="price">
            $0.01 <span>/ request</span>
          </div>
          <p style={{fontSize: '0.8rem', color: 'var(--text3)', marginTop: '0.25rem'}}>
            Free tier: 1,000 requests/day, no credit card required
          </p>
          <div className="pricing-cta">
            <Link to="/signup" className="btn btn-primary btn-block">
              Start Free
            </Link>
          </div>
          <ul className="pricing-features">
            <li>Disposable email detection</li>
            <li>VPN, proxy, and Tor detection</li>
            <li>Custom blacklists</li>
            <li>Edge deployment, &lt;50ms p95 latency</li>
            <li>Usage analytics via API and response headers</li>
            <li>No monthly minimum, cancel anytime</li>
          </ul>
        </div>
      </div>

      <div className="compare-section">
        <h3>Why this is cheaper than alternatives</h3>
        <p>
          Most fraud detection services charge a monthly minimum. If you send
          10,000 requests in a month, you pay the same as 1 million.
          SignupDoggy charges per request. Low volume costs you virtually
          nothing. High volume costs the same per request as low volume.
        </p>
        <table className="compare-table">
          <thead>
            <tr>
              <th></th>
              <th>SignupDoggy</th>
              <th>SignupGate</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Starting price</td>
              <td className="winner">Free (1k/day)</td>
              <td>$29/month</td>
            </tr>
            <tr>
              <td>Per request (paid)</td>
              <td className="winner">$0.01</td>
              <td>$0.005-$0.10</td>
            </tr>
            <tr>
              <td>Monthly minimum</td>
              <td className="winner">$0</td>
              <td>$29</td>
            </tr>
            <tr>
              <td>Setup fee</td>
              <td className="winner">$0</td>
              <td>$0</td>
            </tr>
            <tr>
              <td>Contract</td>
              <td className="winner">None</td>
              <td>None</td>
            </tr>
            <tr>
              <td>Free tier</td>
              <td className="winner">1,000/day</td>
              <td>Trial only</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
