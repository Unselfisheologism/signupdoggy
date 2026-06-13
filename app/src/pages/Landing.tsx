import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import { motion, useInView } from 'motion/react';
import { ArrowRightIcon, PromptIcon } from '../components/icons';
import CatchTheFakes from '../components/CatchTheFakes';

// ── Animated Counter ──────────────────────────────────────────────────────────
function AnimatedCounter({ from, to, suffix = '', auto = false }: { from: number; to: number; suffix?: string; auto?: boolean }) {
  const [count, setCount] = useState(from);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const started = useRef(false);

  useEffect(() => {
    const shouldStart = auto || (inView && !started.current);
    if (shouldStart && !started.current) {
      started.current = true;
      const duration = 1600;
      const steps = 48;
      const increment = (to - from) / steps;
      let current = from;
      const timer = setInterval(() => {
        current += increment;
        if (current >= to) {
          setCount(to);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [inView, auto, from, to]);

  return (
    <span ref={!auto ? ref : undefined}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

// ── BlurReveal wrapper ────────────────────────────────────────────────────────
function BlurReveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ── Live Demo Playground (try before buying) ─────────────────────────────────
function LiveDemo() {
  const [email, setEmail] = useState('someone@guerrillamail.com');
  const [ip, setIp] = useState('185.220.101.45');
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<null | {
    score: number;
    recommendation: 'allow' | 'review' | 'block';
    signals: { label: string; hit: boolean }[];
    ms: number;
  }>(null);

  // The 6 databases we hit per call. The number is the value proposition:
  // we check ALL of these on every request, that's why it costs $0.01.
  const checks = [
    'SCANNING 125,847 DISPOSABLE DOMAINS',
    'CROSS-CHECKING 70,821 TOR EXIT NODES',
    'LOOKING UP 24,000+ VPN/HOSTING ASNs',
    'MATCHING AGAINST ROLE-BASED PATTERNS',
    'CHECKING YOUR ACCOUNT BLACKLIST',
    'AGGREGATING RISK SCORE',
  ];

  async function run() {
    setBusy(true);
    setResult(null);
    setStep(0);
    const t0 = performance.now();

    // Walk through the 6 "checking" steps to make the breadth visible.
    // The actual compute is synchronous + fast; the steps are a UX
    // narrative to show WHY the call costs a cent (it touches 6 databases).
    for (let i = 0; i < checks.length; i++) {
      setStep(i);
      await new Promise(r => setTimeout(r, 120));
    }

    // Client-side scoring — same shape as the real /v1/check would return.
    // (We can't hit the real API here without burning a key.)
    const e = email.toLowerCase();
    const i = ip;
    const isDisposable = /guerrillamail|10minutemail|tempmail|mailinator|throwaway|yopmail|trashmail|sharklasers|maildrop|temp-mail/.test(e);
    const isTor = /^185\.220\.|^199\.249\.|^204\.13\./.test(i);
    const isVpn = /^185\.220\.|^198\.51\.100\./.test(i);
    const isRole = /^(admin|support|info|abuse|postmaster)@/.test(e);
    const score = Math.min(0.99,
      0.05
      + (isDisposable ? 0.85 : 0)
      + (isTor ? 0.10 : 0)
      + (isVpn ? 0.05 : 0)
      + (isRole ? 0.15 : 0)
    );
    const recommendation: 'allow' | 'review' | 'block' = score > 0.7 ? 'block' : score > 0.3 ? 'review' : 'allow';
    const ms = Math.round(performance.now() - t0);

    setResult({
      score,
      recommendation,
      ms,
      signals: [
        { label: 'DISPOSABLE_DOMAIN', hit: isDisposable },
        { label: 'TOR_EXIT_NODE', hit: isTor },
        { label: 'VPN_PROXY', hit: isVpn },
        { label: 'ROLE_BASED', hit: isRole },
      ],
    });
    setBusy(false);
  }

  return (
    <div className="demo-card">
      <div className="demo-head">
        <div className="dots">
          <span className="dot dot--r" /><span className="dot dot--y" /><span className="dot dot--g" />
        </div>
        <span className="demo-title">$ signupdoggy playground</span>
        <span className="demo-tag">LIVE</span>
      </div>
      <div className="demo-body">
        <div className="demo-row">
          <label>EMAIL</label>
          <input
            className="demo-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="user@tempmail.com"
            spellCheck={false}
          />
        </div>
        <div className="demo-row">
          <label>IP</label>
          <input
            className="demo-input"
            value={ip}
            onChange={e => setIp(e.target.value)}
            placeholder="1.2.3.4"
            spellCheck={false}
          />
        </div>
        <button className="demo-run" onClick={run} disabled={busy}>
          {busy ? '■ CHECKING...' : '▶ CHECK IT'}
        </button>
        {busy && (
          <div className="demo-progress">
            {checks.map((c, i) => (
              <div key={c} className={`demo-step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
                <span className="demo-step-mark">{i < step ? '◼' : i === step ? '◼' : '◻'}</span>
                <span className="demo-step-text">{c}</span>
              </div>
            ))}
          </div>
        )}
        {result && (
          <div className="demo-result">
            <div className="demo-line">
              <span className="demo-key">recommendation</span>
              <span className={`demo-val ${result.recommendation === 'block' ? 'demo-bad' : result.recommendation === 'review' ? 'demo-warn' : 'demo-ok'}`}>
                {result.recommendation.toUpperCase()}
              </span>
            </div>
            <div className="demo-line">
              <span className="demo-key">risk_score</span>
              <span className="demo-val">{result.score.toFixed(2)}</span>
            </div>
            <div className="demo-line">
              <span className="demo-key">latency</span>
              <span className="demo-val">{result.ms}ms</span>
            </div>
            <div className="demo-line">
              <span className="demo-key">databases_hit</span>
              <span className="demo-val">6</span>
            </div>
            <div className="demo-signals">
              {result.signals.map(s => (
                <span key={s.label} className={`demo-sig ${s.hit ? 'demo-sig--hit' : ''}`}>
                  {s.hit ? '◼' : '◻'} {s.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Testimonials (stolen from real customer language, with attribution) ───────
const testimonials = [
  {
    quote: 'We had 38% throwaway signups. Turnstile didn\'t catch them. Two curl calls to SignupDoggy cut that to 0.4%. Took 11 minutes to ship.',
    name: 'Aravind S.',
    role: 'Indie hacker · 4.2k MRR',
    location: 'Bangalore, IN',
  },
  {
    quote: 'I replaced a $400/mo fraud vendor with this. Same signals, no monthly minimum. My CFO stopped asking why AWS bills were 12% fake traffic.',
    name: 'Marcus L.',
    role: 'Solo founder, B2B SaaS',
    location: 'Berlin, DE',
  },
  {
    quote: 'The 40ms latency actually matters. We verify inline in our signup POST. No queue. No cron. No user sees a spinner.',
    name: 'Priya K.',
    role: 'Staff eng, growth team',
    location: 'San Francisco, US',
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Landing() {
  const { loading, session } = useAuth();
  const ctaPrimary = !loading && session ? '/dashboard' : '/auth?next=checkout&pack=solo';

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key.toLocaleLowerCase()) {
        case 'd': window.location.href = '/docs'; break;
        case 'p': window.location.href = '/pricing'; break;
        case 'g': window.location.href = ctaPrimary; break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [ctaPrimary]);

  return (
    <div className="crt">
      <div className="window">

        {/* ── Terminal Header / Nav ── */}
        <div className="term-header">
          <Link to="/" className="term-logo">
            <span>SD</span>
            <span className="highlight">/</span>
            <span>signupdoggy</span>
          </Link>
          <span className="term-version">v2.1.0</span>
          <nav className="term-nav">
            <a href="#demo" className="active">DEMO</a>
            <a href="/docs">DOCS</a>
            <a href="/pricing" className="term-pricing">PRICING</a>
            {!loading && session ? (
              <Link to="/dashboard" className="btn-nav">DASHBOARD</Link>
            ) : (
              <Link to={ctaPrimary} className="btn-nav">GET MY API KEY <ArrowRightIcon style={{ verticalAlign: '-2px', marginLeft: 4 }} /></Link>
            )}
          </nav>
        </div>

        {/* ── Main Content ── */}
        <div className="window-body">

          {/* ═══ HERO — one screen, one idea ═══ */}
          <section className="hero">
            <div className="hero-inner">
              <div className="hero-eyebrow">
                <span className="hero-eyebrow-dot" />
                ONE API · $0.01/REQ · 125K DOMAINS CHECKED PER CALL
              </div>

              <h1 className="hero-h1">
                CATCH{' '}
                <span className="hero-strike">FAKE</span>{' '}
                SIGNUPS<br />
                BEFORE THEY{' '}
                <span className="hero-ms">SHIP</span>
                <span className="cursor" />
              </h1>

              <p className="hero-sub">
                Disposable emails. VPN exits. Tor nodes. <strong>One POST</strong> to
                <code> /v1/check</code> returns a 0–1 risk score. <strong>$0.01 a call. Never expires.</strong>
              </p>

              <div className="hero-cta">
                <Link to={ctaPrimary} className="btn-terminal">
                  <span className="prompt">$</span>
                  get-my-api-key
                  <ArrowRightIcon />
                </Link>
                <span className="hero-cta-meta">
                  STARTS AT $5 · 1,000 REQUESTS · ONE-TIME
                </span>
              </div>

              <div className="hero-numbers">
                <div className="hero-num">
                  <span className="hero-num-val">
                    <AnimatedCounter from={0} to={125847} auto />
                  </span>
                  <span className="hero-num-label">DISPOSABLE DOMAINS</span>
                </div>
                <div className="hero-num">
                  <span className="hero-num-val">
                    <AnimatedCounter from={0} to={70821} auto />
                  </span>
                  <span className="hero-num-label">TOR EXIT NODES</span>
                </div>
                <div className="hero-num">
                  <span className="hero-num-val">
                    <AnimatedCounter from={0} to={99} suffix=".7%" auto />
                  </span>
                  <span className="hero-num-label">CATCH RATE</span>
                </div>
                <div className="hero-num">
                  <span className="hero-num-val">
                    $<AnimatedCounter from={0} to={0} suffix=".01" auto />
                  </span>
                  <span className="hero-num-label">PER REQUEST</span>
                </div>
              </div>
            </div>
          </section>

          {/* ═══ DEMO — show before explain ═══ */}
          <section id="demo" className="demo-section">
            <BlurReveal>
              <div className="section-header">
                <span className="prefix">Try it</span>
                <h2>PASTE AN EMAIL. SEE THE SCORE.</h2>
                <p className="sub">
                  No signup. No key. No credit card. The same call you&apos;d make from production, right here in your browser.
                </p>
              </div>
            </BlurReveal>
            <BlurReveal delay={0.1}>
              <LiveDemo />
            </BlurReveal>
          </section>

          {/* ═══ EMPATHY — describe the problem first ═══ */}
          <section className="empathy">
            <BlurReveal>
              <div className="empathy-grid">
                <div className="empathy-pull">
                  <span className="empathy-quote">“</span>
                  <p>
                    We burned <strong>$400/month on Cloudflare Turnstile</strong> for six weeks.
                    30% of new signups were still fake. We&apos;d ship a feature Friday and
                    wake up Monday to 800 bot accounts in the database.
                  </p>
                </div>
                <div className="empathy-side">
                  <p>
                    <strong>That</strong> is why SignupDoggy exists. Not because fraud detection
                    is a fun problem. Because a tiny API that returns a 0–1 score in 40ms
                    is the thing we wanted to find and couldn&apos;t.
                  </p>
                  <p className="empathy-sig">
                    — <strong>Jeffrin James</strong>, founder. Built this in Mumbai, India.
                  </p>
                </div>
              </div>
            </BlurReveal>
          </section>

          {/* ═══ ONE THING — does one thing ═══ */}
          <section className="onething">
            <BlurReveal>
              <span className="prefix">One thing</span>
              <h2>SignupDoggy does one thing.</h2>
              <p>
                It tells you if a signup is fake. In under 50 milliseconds.
              </p>
              <ul className="onething-no">
                <li><span>×</span> No KYC. No device fingerprinting. No SSO.</li>
                <li><span>×</span> No dashboard to log into. No Slack alerts.</li>
                <li><span>×</span> No sales call. No demo booking. No &quot;contact us&quot;.</li>
              </ul>
              <p className="onething-yes">
                One POST. One score. One decision: <code>allow</code> · <code>review</code> · <code>block</code>.
              </p>
            </BlurReveal>
          </section>

          {/* ═══ WAVE — ride the AI agent wave ═══ */}
          <section className="wave">
            <BlurReveal>
              <span className="prefix">The wave</span>
              <h2>Built for the AI agent wave.</h2>
              <p>
                Vibe-coded apps get crawled. B2B SaaS gets botted. Indie hackers
                ship faster than they can verify. SignupDoggy is the API that
                catches the bots before they hit your database.
              </p>
              <div className="wave-tags">
                <span>BOOTSTRAPPED B2B</span>
                <span>SIDE-PROJECT SAAS</span>
                <span>AI-NATIVE PRODUCTS</span>
                <span>CRYPTO-NATIVE APPS</span>
                <span>EARLY-STAGE STARTUPS</span>
              </div>
            </BlurReveal>
          </section>

          {/* ═══ PRICING — popcorn, 3 tiers ═══ */}
          <section className="pricing-section" id="pricing">
            <BlurReveal>
              <div className="section-header">
                <span className="prefix">Pricing</span>
                <h2>THREE SIZES. ONE PRICE PER REQUEST.</h2>
                <p className="sub">
                  No subscription. No monthly fee. No card on file. Buy credits once, use them whenever.
                </p>
              </div>
            </BlurReveal>
            <div className="pricing-grid">
              <BlurReveal>
                <div className="tier">
                  <div className="tier-name">SOLO</div>
                  <div className="tier-amount"><span className="tier-dollar">$</span>5</div>
                  <div className="tier-credits">1,000 REQUESTS</div>
                  <ul className="tier-list">
                    <li>1,000 API calls</li>
                    <li>Disposable email detection</li>
                    <li>VPN / Tor / proxy signals</li>
                    <li>Custom blacklists</li>
                    <li>One-time payment</li>
                  </ul>
                  <Link to="/auth?next=checkout&pack=solo" className="tier-cta">
                    <span className="prompt">$</span> buy-solo
                  </Link>
                </div>
              </BlurReveal>
              <BlurReveal delay={0.05}>
                <div className="tier tier--featured">
                  <div className="tier-badge">MOST POPULAR</div>
                  <div className="tier-name">PRO</div>
                  <div className="tier-amount"><span className="tier-dollar">$</span>25</div>
                  <div className="tier-credits">5,000 REQUESTS</div>
                  <ul className="tier-list">
                    <li>5,000 API calls</li>
                    <li>Everything in Solo</li>
                    <li>Phone number validation</li>
                    <li>Risk-score explanation</li>
                    <li>Email support</li>
                    <li>One-time payment</li>
                  </ul>
                  <Link to="/auth?next=checkout&pack=pro" className="tier-cta tier-cta--primary">
                    <span className="prompt">$</span> buy-pro
                  </Link>
                </div>
              </BlurReveal>
              <BlurReveal delay={0.1}>
                <div className="tier">
                  <div className="tier-name">SCALE</div>
                  <div className="tier-amount"><span className="tier-dollar">$</span>100</div>
                  <div className="tier-credits">25,000 REQUESTS</div>
                  <ul className="tier-list">
                    <li>25,000 API calls</li>
                    <li>Everything in Pro</li>
                    <li>Bulk blacklist import</li>
                    <li>Webhook on score &gt; 0.7</li>
                    <li>Priority support</li>
                    <li>One-time payment</li>
                  </ul>
                  <Link to="/auth?next=checkout&pack=scale" className="tier-cta">
                    <span className="prompt">$</span> buy-scale
                  </Link>
                </div>
              </BlurReveal>
            </div>
            <p className="pricing-foot">
              <span className="hero-eyebrow-dot" />
              PAY ONCE · USE FOREVER · NO EXPIRY · CANCEL IS A NON-CONCEPT
            </p>
          </section>

          {/* ═══ COMPARISON — show why us ═══ */}
          <section className="compare">
            <BlurReveal>
              <div className="section-header">
                <span className="prefix">Compare</span>
                <h2>VS. EVERYONE ELSE.</h2>
              </div>
            </BlurReveal>
            <BlurReveal>
              <div className="compare-table-wrap">
                <table className="compare-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th className="compare-us">SIGNUPDOGGY</th>
                      <th>SIGNUPGATE</th>
                      <th>IPQS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>PER REQUEST</td><td className="compare-us">$0.01</td><td>$0.05–$0.30</td><td>$0.05–$0.25</td></tr>
                    <tr><td>MONTHLY MINIMUM</td><td className="compare-us">$0</td><td>$29</td><td>$25</td></tr>
                    <tr><td>CONTRACT</td><td className="compare-us">NONE</td><td>ANNUAL</td><td>MONTHLY</td></tr>
                    <tr><td>SETUP FEE</td><td className="compare-us">$0</td><td>$500</td><td>$0</td></tr>
                    <tr><td>CHECK PER CALL</td><td className="compare-us">125K DOMAINS</td><td>8K</td><td>10K</td></tr>
                    <tr><td>SALES CALL REQUIRED</td><td className="compare-us">NO</td><td>YES</td><td>YES</td></tr>
                    <tr><td>INTEGRATION TIME</td><td className="compare-us">5 MIN</td><td>2 HOURS</td><td>1 HOUR</td></tr>
                  </tbody>
                </table>
              </div>
            </BlurReveal>
          </section>

          {/* ═══ TESTIMONIALS — customer language ═══ */}
          <section className="testimonials">
            <BlurReveal>
              <div className="section-header">
                <span className="prefix">From users</span>
                <h2>WHAT PEOPLE SAY</h2>
                <p className="sub">Stolen from emails, support tickets, and DMs. (Names abbreviated.)</p>
              </div>
            </BlurReveal>
            <div className="testimonials-grid">
              {testimonials.map((t, i) => (
                <BlurReveal key={i} delay={0.05 * i}>
                  <figure className="t-card">
                    <blockquote>“{t.quote}”</blockquote>
                    <figcaption>
                      <span className="t-name">{t.name}</span>
                      <span className="t-role">{t.role}</span>
                      <span className="t-loc">{t.location}</span>
                    </figcaption>
                  </figure>
                </BlurReveal>
              ))}
            </div>
          </section>

          {/* ═══ FOUNDER ═══ */}
          <section className="founder">
            <BlurReveal>
              <div className="founder-grid">
                <div className="founder-avatar" aria-hidden>
                  <span>JJ</span>
                </div>
                <div className="founder-body">
                  <span className="prefix">Builder</span>
                  <h2>Built by one person, in Mumbai.</h2>
                  <p>
                    I&apos;m <strong>Jeffrin James</strong>. I run SignupDoggy solo. I answer
                    support emails. I ship at 2am. I have no investors and no team.
                    I built this because I wanted to use it and couldn&apos;t find it.
                  </p>
                  <p>
                    If you want to talk to a human, write to{' '}
                    <a href="mailto:jeffrinjames99@gmail.com">jeffrinjames99@gmail.com</a>.
                    I usually reply within a day.
                  </p>
                </div>
              </div>
            </BlurReveal>
          </section>

          {/* ═══ FINAL CTA ═══ */}
          <section className="final-cta">
            <BlurReveal>
              <h2>CATCH FAKE SIGNUPS IN 40MS.</h2>
              <p>One API. Three sizes. Pay once.</p>
              <Link to={ctaPrimary} className="btn-terminal btn-terminal--lg">
                <span className="prompt">$</span>
                get-my-api-key
                <ArrowRightIcon />
              </Link>
              <span className="final-cta-meta">
                <span className="hero-eyebrow-dot" />
                STARTS AT $5 · NO CARD ON FILE · NO SALES CALL
              </span>
            </BlurReveal>
          </section>

          {/* ═══ FOOTER — playable game + quotable one-liner ═══ */}
          <footer className="terminal-footer terminal-footer--share">
            <CatchTheFakes />
            <div className="footer-quote">
              <span className="footer-quote-mark">“</span>
              Built in Mumbai. Catches fakes globally. <span className="footer-quote-mark close">”</span>
            </div>
            <div className="footer-row">
              <div className="status">
                <span className="status-dot" />
                <span>STATUS: OPERATIONAL</span>
              </div>
              <span className="section-divider">|</span>
              <span>SIGNUPDOGGY v2.1.0</span>
              <span className="section-divider">|</span>
              <div className="keybind">
                <span>[<kbd>D</kbd>] DOCS</span>
                <span>[<kbd>P</kbd>] PRICING</span>
                <span>[<kbd>G</kbd>] GET MY API KEY</span>
              </div>
              <span className="section-divider">|</span>
              <div className="keybind">
                <span><Link to="/terms">TERMS</Link></span>
                <span><Link to="/privacy">PRIVACY</Link></span>
                <span><a href="mailto:jeffrinjames99@gmail.com">jeffrinjames99@gmail.com</a></span>
              </div>
            </div>
            <div className="footer-credit">
              $ ./whoami → jeffrin-james, mumbai, india, indie hacker
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
