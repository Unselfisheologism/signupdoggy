import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';

export default function Pricing() {
  return (
    <AppLayout>
      <div className="page-content">
        <div className="term-banner">
          <span className="banner-prompt">$</span> ./pricing --list
          <span className="banner-status">● PAY AS YOU GO</span>
        </div>

        <div className="pricing-single">
          <div className="pricing-card-featured">
            <div className="pricing-card-top">
              <span className="pricing-badge">RECOMMENDED</span>
              <h2 className="pricing-name">$ ./pay-as-you-go</h2>
              <p className="pricing-desc">ONE API KEY. SAME PRICE AT EVERY SCALE.</p>
              <div className="pricing-amount">
                <span className="pricing-dollar">$</span>
                <span className="pricing-number">0.01</span>
                <span className="pricing-per">/ REQUEST</span>
              </div>
              <div className="pricing-free-tier">
                <span className="pricing-free-green">●</span>
                FREE TIER: 1,000 REQUESTS/DAY, NO CREDIT CARD
              </div>
              <Link to="/signup" className="btn-terminal btn-terminal--full pricing-cta-btn">
                <span className="prompt">$</span>
                ./start-free
              </Link>
            </div>
            <div className="pricing-card-features">
              <div className="pricing-features-header">INCLUDES</div>
              <ul className="pricing-features-list">
                <li><span className="pf-check">▸</span> DISPOSABLE EMAIL DETECTION</li>
                <li><span className="pf-check">▸</span> VPN, PROXY & TOR DETECTION</li>
                <li><span className="pf-check">▸</span> CUSTOM BLACKLISTS</li>
                <li><span className="pf-check">▸</span> EDGE DEPLOYMENT &lt;50MS P95</li>
                <li><span className="pf-check">▸</span> USAGE ANALYTICS VIA API</li>
                <li><span className="pf-check">▸</span> NO MINIMUM, CANCEL ANYTIME</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Comparison table */}
        <div className="pricing-compare">
          <div className="dash-section-header">
            <span className="dash-section-tag">COMPARE</span>
            <span className="dash-section-title">WHY WE'RE CHEAPER</span>
          </div>
          <p className="pricing-compare-desc">
            MOST FRAUD SERVICES CHARGE A MONTHLY MINIMUM. SIGNUPDOGGY CHARGES PER REQUEST.
            LOW VOLUME COSTS YOU VIRTUALLY NOTHING. HIGH VOLUME COSTS THE SAME AS LOW.
          </p>
          <div className="pricing-table-wrap">
            <table className="pricing-table">
              <thead>
                <tr>
                  <th></th>
                  <th className="pricing-th-win">SIGNUPDOGGY</th>
                  <th className="pricing-th-other">SIGNUPGATE</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['STARTING PRICE', 'FREE (1K/DAY)', '$29/MONTH'],
                  ['PER REQUEST (PAID)', '$0.01', '$0.005–$0.10'],
                  ['MONTHLY MINIMUM', '$0', '$29'],
                  ['SETUP FEE', '$0', '$0'],
                  ['CONTRACT', 'NONE', 'NONE'],
                  ['FREE TIER', '1,000/DAY', 'TRIAL ONLY'],
                ].map(([label, us, them], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'pricing-row-even' : ''}>
                    <td className="pricing-row-label">{label}</td>
                    <td className="pricing-row-win"><span className="pricing-win-mark">▶</span> {us}</td>
                    <td className="pricing-row-other">{them}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
