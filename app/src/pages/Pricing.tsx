import { Link, useSearchParams } from 'react-router-dom';
import AppLayout from '../components/AppLayout';

// 1 credit = $0.01 USD. Credit-based, pay-as-you-go.
// The 3 sizes below are top-up packs. Credits never expire.
// (Pack IDs map onto the existing Dodo products in portal-api/src/index.ts
//  via the `packMap` in Auth.tsx / Signup.tsx / Login.tsx — no backend change.)
const topups = [
  { id: 'solo', credits: 500, dollars: 5, popular: false },
  { id: 'pro', credits: 2500, dollars: 25, popular: true },
  { id: 'scale', credits: 10000, dollars: 100, popular: false },
];

// Optional monthly subscription. Doesn't replace top-up — adds it.
const subs = [
  { id: 'plus', name: 'PLUS', price: 20, monthlyCredits: 2200, perReq: '$0.009 / REQ' },
  { id: 'super', name: 'SUPER', price: 100, monthlyCredits: 11000, perReq: '$0.009 / REQ' },
  { id: 'ultra', name: 'ULTRA', price: 200, monthlyCredits: 22000, perReq: '$0.009 / REQ' },
];

export default function Pricing() {
  const [params] = useSearchParams();
  const requested = params.get('pack');
  return (
    <AppLayout>
      <div className="page-content">
        <div className="term-banner">
          <span className="banner-prompt">$</span> ./pricing --list
          <span className="banner-status">● CREDITS · 1 = $0.01 · NEVER EXPIRES</span>
        </div>

        <h1 className="docs-h1">PRICING</h1>
        <p className="docs-lead">
          CREDIT-BASED. 1 CREDIT = $0.01. PAY ONCE OR SUBSCRIBE MONTHLY. AUTO-REFILL OPTIONAL.
        </p>

        {/* ═══ TOP-UP CREDITS — primary ═══ */}
        <h2 className="docs-h2"># TOP-UP CREDITS</h2>
        <p className="docs-p" style={{ marginBottom: 'var(--space-lg)' }}>
          BUY ONCE. USE WHENEVER. CREDITS NEVER EXPIRE. NO MONTHLY MINIMUM. <strong>1 CREDIT = $0.01.</strong>
        </p>

        <div className="tier-grid">
          {topups.map((t) => {
            const featured = requested === t.id || t.popular;
            return (
              <div key={t.id} className={`tier ${featured ? 'tier--featured' : ''}`}>
                {featured && t.popular && <div className="tier-badge">MOST POPULAR</div>}
                {featured && !t.popular && <div className="tier-badge">YOUR PICK</div>}
                <div className="tier-name">{t.id.toUpperCase()}</div>
                <div className="tier-amount">
                  <span className="tier-dollar">$</span>{t.dollars}
                </div>
                <div className="tier-credits">{t.credits.toLocaleString()} CREDITS</div>
                <div className="tier-perreq">≈ ${(t.dollars / t.credits * 100).toFixed(4)} / REQ · NEVER EXPIRES</div>
                <ul className="tier-list">
                  <li><span className="pf-check">▸</span> {t.credits.toLocaleString()} API REQUESTS</li>
                  <li><span className="pf-check">▸</span> Disposable email detection</li>
                  <li><span className="pf-check">▸</span> VPN / proxy / Tor detection</li>
                  <li><span className="pf-check">▸</span> Custom blacklists</li>
                  <li><span className="pf-check">▸</span> One-time payment</li>
                </ul>
                <Link to={`/auth?next=checkout&pack=${t.id}`} className={`tier-cta ${featured ? 'tier-cta--primary' : ''}`}>
                  <span className="prompt">$</span> buy-{t.id}
                </Link>
                <div className="tier-foot">Pay once. Use forever.</div>
              </div>
            );
          })}
        </div>

        <p className="pricing-foot">
          <span className="hero-eyebrow-dot" />
          NO MONTHLY MINIMUM · NO CONTRACT · NO EXPIRY · NO SALES CALL
        </p>

        {/* ═══ MONTHLY SUBSCRIPTION — optional ═══ */}
        <h2 className="docs-h2" style={{ marginTop: 'var(--space-3xl)' }}># MONTHLY SUBSCRIPTION (OPTIONAL)</h2>
        <p className="docs-p" style={{ marginBottom: 'var(--space-lg)' }}>
          PREFER PREDICTABLE BILLING? SUBSCRIBE MONTHLY. YOU STILL GET A SHARED CREDIT POOL; TOP-UP ROLLS OVER IF YOU GO OVER. <strong>YOU CAN CANCEL ANYTIME.</strong>
        </p>

        <div className="tier-grid">
          {subs.map((s) => (
            <div key={s.id} className="tier">
              <div className="tier-name">{s.name}</div>
              <div className="tier-amount">
                <span className="tier-dollar">$</span>{s.price}<span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/MO</span>
              </div>
              <div className="tier-credits">{s.monthlyCredits.toLocaleString()} CREDITS / MO</div>
              <div className="tier-perreq">+ 10% BONUS · {s.perReq}</div>
              <ul className="tier-list">
                <li><span className="pf-check">▸</span> {s.monthlyCredits.toLocaleString()} credits / month</li>
                <li><span className="pf-check">▸</span> Rollover up to 1× monthly cap</li>
                <li><span className="pf-check">▸</span> Phone validation included</li>
                <li><span className="pf-check">▸</span> Email support (&lt;24h reply)</li>
                <li><span className="pf-check">▸</span> Cancel anytime</li>
              </ul>
              <Link to={`/auth?next=checkout&sub=${s.id}`} className="tier-cta">
                <span className="prompt">$</span> subscribe
              </Link>
              <div className="tier-foot">Billed monthly. Stripe.</div>
            </div>
          ))}
        </div>

        {/* ═══ AUTO-REFILL — optional ═══ */}
        <h2 className="docs-h2" style={{ marginTop: 'var(--space-3xl)' }}># AUTO-REFILL (OPTIONAL)</h2>
        <p className="docs-p" style={{ marginBottom: 'var(--space-lg)' }}>
          SET A LOW-BALANCE THRESHOLD. WHEN YOU HIT IT, WE TOP YOU UP AUTOMATICALLY WITH THE PACK YOU PICK. NO SURPRISE OVERAGES.
        </p>
        <div className="autoref-card">
          <div className="autoref-row">
            <div>
              <div className="autoref-label">TRIGGER WHEN BALANCE DROPS BELOW</div>
              <div className="autoref-val">500 CREDITS  ($5)</div>
            </div>
            <div>
              <div className="autoref-label">THEN BUY</div>
              <div className="autoref-val">2,500 CREDITS  ($25)</div>
            </div>
            <div>
              <div className="autoref-label">MAX PER MONTH</div>
              <div className="autoref-val">UNLIMITED</div>
            </div>
          </div>
          <p className="autoref-foot">
            CONFIGURED IN THE DASHBOARD UNDER <code>/billing</code>. TOGGLE OFF ANYTIME. NO CONTRACT.
          </p>
        </div>

        {/* ═══ COMPARE ═══ */}
        <div className="pricing-compare" style={{ marginTop: 'var(--space-3xl)' }}>
          <div className="dash-section-header">
            <span className="dash-section-tag">COMPARE</span>
            <span className="dash-section-title">VS. THE OTHER GUYS</span>
          </div>
          <div className="pricing-table-wrap">
            <table className="pricing-table">
              <thead>
                <tr>
                  <th></th>
                  <th className="pricing-th-win">SIGNUPDOGGY</th>
                  <th className="pricing-th-other">SIGNUPGATE</th>
                  <th className="pricing-th-other">IPQS</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['PER REQUEST', '$0.01', '$0.05–$0.30', '$0.05–$0.25'],
                  ['MONTHLY MINIMUM', '$0', '$29', '$25'],
                  ['CONTRACT', 'NONE', 'ANNUAL', 'MONTHLY'],
                  ['SETUP FEE', '$0', '$500', '$0'],
                  ['CHECK PER CALL', '125K DOMAINS', '8K', '10K'],
                  ['SALES CALL', 'NO', 'YES', 'YES'],
                  ['INTEGRATION TIME', '5 MIN', '2 HOURS', '1 HOUR'],
                ].map(([label, us, a, b], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'pricing-row-even' : ''}>
                    <td className="pricing-row-label">{label}</td>
                    <td className="pricing-row-win"><span className="pricing-win-mark">▶</span> {us}</td>
                    <td className="pricing-row-other">{a}</td>
                    <td className="pricing-row-other">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ═══ FAQ ═══ */}
        <div className="pricing-faq">
          <div className="dash-section-header">
            <span className="dash-section-tag">FAQ</span>
            <span className="dash-section-title">THE QUESTIONS</span>
          </div>
          <div className="faq-grid">
            <div className="faq-q">
              <h3>DO CREDITS EXPIRE?</h3>
              <p>No. Buy once, use them in a week or a year. We don&apos;t expire credits.</p>
            </div>
            <div className="faq-q">
              <h3>IS THERE A TRIAL?</h3>
              <p>There&apos;s a <a href="/#demo">live demo</a> on the homepage. Paste an email, see a real score, no signup. The playground <em>is</em> the trial.</p>
            </div>
            <div className="faq-q">
              <h3>WHY NOT JUST $0/MO FREE?</h3>
              <p>Because less than 3% of free users ever convert. We don&apos;t build features for them. We build for people who pay.</p>
            </div>
            <div className="faq-q">
              <h3>DO I HAVE TO SUBSCRIBE?</h3>
              <p>No. Buy a one-time pack above and you&apos;re done. Subscribe only if you want monthly credits that auto-renew.</p>
            </div>
            <div className="faq-q">
              <h3>WHAT IF I BURN THROUGH MY CREDITS?</h3>
              <p>The dashboard will alert you. Buy more at any time, or set up auto-refill so you never hit zero.</p>
            </div>
            <div className="faq-q">
              <h3>1 CREDIT = $0.01?</h3>
              <p>Yes. Every API call costs 1 credit. If you buy 2,500 credits for $25, that&apos;s 2,500 API calls. 1 call = 1¢.</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
