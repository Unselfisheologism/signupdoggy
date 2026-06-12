import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import { motion, useInView, animate, useMotionValue, useTransform, useScroll } from 'motion/react';

// ── Animated Counter ──
function AnimatedCounter({ from, to, suffix = '', auto = true }: { from: number; to: number; suffix?: string; auto?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [started, setStarted] = useState(auto);
  const count = useMotionValue(from);
  const rounded = useTransform(count, v => Math.round(v * 10) / 10);
  const [display, setDisplay] = useState(String(from));

  useEffect(() => {
    if (!started && !inView) return;
    const controls = animate(count, to, { duration: 2, ease: 'easeOut' });
    const unsubscribe = rounded.on('change', v => setDisplay(v + suffix));
    return () => { controls.stop(); unsubscribe(); };
  }, [started, inView]);

  return <span ref={ref}>{display}</span>;
}

// ── Placeholder Logo URLs (replace with your actual logo images) ──
const trustLogos = [
  { name: 'Vercel', url: 'https://assets-global.website-files.com/6442910b5f6bee1a0e66b7b9/64b6e331b6b95a398732a426_vercel-logotype-light.svg' },
  { name: 'Linear', url: 'https://cdn.sanity.io/images/1z5g6za5/production/57b3e0937caf56e5fea19d4a1269f7f2c182ae0e-24x24.svg' },
  { name: 'Supabase', url: 'https://supabase.com/dashboard/img/supabase-logo.svg' },
  { name: 'Stripe', url: 'https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/stripe.svg' },
  { name: 'GitHub', url: 'https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/github.svg' },
  { name: 'Cloudflare', url: 'https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/cloudflare.svg' },
];

// ── Trust Bar: Infinite Auto-Scroll ──
function TrustBar() {
  return (
    <section className="trust-bar">
      <p className="trust-label">Trusted by engineering teams</p>
      <div className="trust-track-wrapper">
        <motion.div
          className="trust-track"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          {[...trustLogos, ...trustLogos].map((logo, i) => (
            <motion.img
              key={i}
              src={logo.url}
              alt={logo.name}
              className="trust-logo-img"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── Feature Card ──
const features = [
  { title: 'Disposable Email Detection', desc: '125K+ known disposable domains blocked instantly. Catches temp mail providers before they sign up.', icon: '✉' },
  { title: 'VPN & Proxy Detection', desc: 'Real-time IP reputation checks identify residential proxies, data centers, and anonymizers.', icon: '🛡' },
  { title: 'Temp Phone Number Blocking', desc: '124K+ temporary phone numbers flagged in O(1) lookups. Strip +, match instantly.', icon: '📱' },
  { title: 'API Key Management', desc: 'Rotate, revoke, and monitor usage per key. Granular rate limiting per customer.', icon: '🔑' },
  { title: 'Credit-Based Billing', desc: 'Pay per successful check — $0.01/request. No monthly minimums, no surprise bills.', icon: '💳' },
  { title: 'Real-Time Alerts', desc: 'Webhook notifications for suspicious signups. Integrate into Slack, PagerDuty, or your own backend.', icon: '⚡' },
];

function FeatureCard({ title, desc, icon, index }: { title: string; desc: string; icon: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      className="feature-card"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
    >
      <span className="feature-icon">{icon}</span>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{desc}</p>
    </motion.div>
  );
}

// ── Terminal Code Content ──
type CodeLine = {
  line: string;
  indent?: boolean;
  prompt?: boolean;
  cmd?: boolean;
  key?: boolean;
  res?: boolean;
  comment?: boolean;
};

const codeContent: Record<string, CodeLine[]> = {
  curl: [
    { line: 'curl -X POST https://signupdoggy-api.workers.dev/v1/check', prompt: true, cmd: true },
    { line: '  -H "Authorization: Bearer sk_live_abc123"', indent: true, key: true },
    { line: '  -H "Content-Type: application/json"', indent: true, key: true },
    { line: '  -d \'{', indent: true },
    { line: '    "email": "user@tempmail.com"', indent: true, res: true },
    { line: '  }\'', indent: true },
    { line: '', indent: false },
    { line: '# Response', comment: true },
    { line: '{', indent: false },
    { line: '  "verdict": "block",', indent: true, res: true },
    { line: '  "recommendation": "high_risk",', indent: true, res: true },
    { line: '  "overall_risk": 0.94,', indent: true, res: true },
    { line: '  "checks": {', indent: true },
    { line: '    "disposable_email": true,', indent: true, res: true },
    { line: '    "vpn_proxy": true,', indent: true, res: true },
    { line: '    "temp_phone": false', indent: true, res: true },
    { line: '  }', indent: true },
    { line: '}', indent: false },
  ],
  node: [
    { line: "import { SignupDoggy } from 'signupdoggy';", cmd: true },
    { line: '', indent: false },
    { line: 'const client = new SignupDoggy({', cmd: true },
    { line: "  apiKey: process.env.SIGNUPDOGGY_KEY", indent: true, cmd: true },
    { line: '});', cmd: true },
    { line: '', indent: false },
    { line: 'const result = await client.check({', cmd: true },
    { line: "  email: 'user@tempmail.com'", indent: true, cmd: true },
    { line: '});', cmd: true },
    { line: '', indent: false },
    { line: "console.log(result.verdict);", cmd: true },
    { line: "// => 'block'", comment: true },
    { line: "console.log(result.overall_risk);", cmd: true },
    { line: "// => 0.94", comment: true },
  ],
  python: [
    { line: 'from signupdoggy import SignupDoggy', cmd: true },
    { line: '', indent: false },
    { line: 'client = SignupDoggy(', cmd: true },
    { line: "  api_key=os.environ['SIGNUPDOGGY_KEY']", indent: true, cmd: true },
    { line: ')', cmd: true },
    { line: '', indent: false },
    { line: 'result = client.check(', cmd: true },
    { line: "  email='user@tempmail.com'", indent: true, cmd: true },
    { line: ')', cmd: true },
    { line: '', indent: false },
    { line: "print(result['verdict'])", cmd: true },
    { line: "# => 'block'", comment: true },
    { line: "print(result['overall_risk'])", cmd: true },
    { line: "# => 0.94", comment: true },
  ],
};

export default function Landing() {
  const { session, loading } = useAuth();
  const [tab, setTab] = useState<'curl' | 'node' | 'python'>('curl');
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (lang: string) => {
    const text = codeContent[lang as keyof typeof codeContent].map(l => l.line).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(lang);
    setTimeout(() => setCopied(null), 1500);
  };

  // Scroll progress indicator
  const { scrollYProgress } = useScroll();

  // Hero ref for text animation
  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: true });

  // Features section ref
  const featuresRef = useRef<HTMLDivElement>(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: '-100px' });

  // Stats ref
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-80px' });

  return (
    <div className="landing-wrapper">
      {/* Scroll progress bar */}
      <motion.div
        className="scroll-progress"
        style={{ scaleX: scrollYProgress }}
      />

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="nav-inner">
          <Link to="/" className="logo">
            <span className="logo-icon">SD</span>
            <span className="logo-text">SignupDoggy</span>
          </Link>
          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#docs" className="nav-link">Docs</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            {!loading && session ? (
              <Link to="/dashboard" className="btn-primary">Dashboard</Link>
            ) : (
              <Link to="/auth" className="btn-primary">Get Started</Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-content">
          <div className="badge-wrapper">
            <span className="badge">NOW IN PUBLIC BETA</span>
          </div>

          <h1 className="hero-h1">
            Stop fake signups.{' '}
            <span className="accent-text">Before they happen.</span>
          </h1>

          <p className="hero-sub">
            One API call to detect disposable emails, VPNs, proxies, and
            temporary phone numbers. Pay only for what you use.
          </p>

          <div className="hero-ctas">
            <Link to="/auth" className="btn-primary btn-lg">Start Free Trial</Link>
            <a href="#docs" className="btn-secondary btn-lg">Read the Docs</a>
          </div>

          <div className="hero-stats-row">
            <div className="hero-stat">
              <span className="hero-stat-num"><AnimatedCounter from={0} to={12} suffix="M+" /></span>
              <span className="hero-stat-label">Requests served</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num"><AnimatedCounter from={0} to={125} suffix="K" /></span>
              <span className="hero-stat-label">Domains blocked</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num"><AnimatedCounter from={0} to={124} suffix="K" /></span>
              <span className="hero-stat-label">Numbers flagged</span>
            </div>
          </div>
        </div>

        {/* Terminal */}
        <div className="hero-terminal-wrapper">
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="terminal-dots">
                <span className="terminal-dot dot-red" />
                <span className="terminal-dot dot-yellow" />
                <span className="terminal-dot dot-green" />
              </div>
              <span className="terminal-title">api-check.mjs</span>
            </div>
            <div className="terminal-body">
              {codeContent.curl.map((l, i) => (
                <div key={i} className={`code-line${l.indent ? ' indent' : ''}${l.prompt ? ' prompt-line' : ''}${l.res ? ' res-line' : ''}${l.comment ? ' comment-line' : ''}${l.cmd ? ' cmd-line' : ''}${l.key ? ' key-line' : ''}`}>
                  {l.prompt && <span className="prompt-symbol">$</span>}
                  <span>{l.line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
      >
        <TrustBar />
      </motion.div>

      {/* ── FEATURES ── */}
      <section className="section" id="features">
        <div className="section-header" ref={featuresRef}>
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            Everything you need to block fraud
          </motion.h2>
          <motion.p
            className="section-sub"
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            Six detection layers that work together to keep fake users out of your product.
          </motion.p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} index={i} />
          ))}
        </div>
      </section>

      {/* ── CODE SHOWCASE ── */}
      <section className="section section-dark" id="docs">
        <div className="section-header">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            One API, three languages
          </motion.h2>
          <motion.p
            className="section-sub"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            Works with whatever stack you use.
          </motion.p>
        </div>

        <motion.div
          className="code-showcase"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="code-tabs">
            {(['curl', 'node', 'python'] as const).map(lang => (
              <button
                key={lang}
                className={`code-tab${tab === lang ? ' active' : ''}`}
                onClick={() => setTab(lang)}
              >
                {lang === 'curl' ? 'cURL' : lang === 'node' ? 'Node.js' : 'Python'}
              </button>
            ))}
            <button
              className={`copy-btn${copied === tab ? ' copied' : ''}`}
              onClick={() => handleCopy(tab)}
            >
              {copied === tab ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="code-block">
            {codeContent[tab].map((l, i) => (
              <div key={i} className={`code-line${l.indent ? ' indent' : ''}${l.prompt ? ' prompt-line' : ''}${l.res ? ' res-line' : ''}${l.comment ? ' comment-line' : ''}${l.cmd ? ' cmd-line' : ''}${l.key ? ' key-line' : ''}`}>
                {l.prompt && <span className="prompt-symbol">$</span>}
                <span>{l.line}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="section" ref={statsRef}>
        <div className="stats-strip">
          <motion.div
            className="stats-strip-item"
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0, duration: 0.5 }}
          >
            <span className="stats-strip-num"><AnimatedCounter from={0} to={500} suffix="+" /></span>
            <span className="stats-strip-label">Customers protected</span>
          </motion.div>
          <motion.div
            className="stats-strip-item"
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <span className="stats-strip-num"><AnimatedCounter from={0} to={99.9} suffix="%" /></span>
            <span className="stats-strip-label">Detection accuracy</span>
          </motion.div>
          <motion.div
            className="stats-strip-item"
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span className="stats-strip-num"><AnimatedCounter from={0} to={25} suffix="ms" /></span>
            <span className="stats-strip-label">Avg response time</span>
          </motion.div>
          <motion.div
            className="stats-strip-item"
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <span className="stats-strip-num"><AnimatedCounter from={0} to={10} suffix="K+" /></span>
            <span className="stats-strip-label">GitHub stars</span>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section cta-section">
        <motion.div
          className="cta-content"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="cta-title">Stop fraud at the door.</h2>
          <p className="cta-sub">$0.01 per request. No minimum. Start in 5 minutes.</p>
          <div className="cta-actions">
            <Link to="/auth" className="btn-primary btn-lg">Get Your API Key</Link>
            <a href="https://docs.signupdoggy.dev" className="btn-secondary btn-lg">View Docs</a>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="logo-icon">SD</span>
            <span className="footer-brand-name">SignupDoggy</span>
          </div>
          <div className="footer-links">
            <a href="#features" className="footer-link">Features</a>
            <a href="#docs" className="footer-link">API Docs</a>
            <a href="#pricing" className="footer-link">Pricing</a>
            <a href="https://github.com/Unselfisheologism/registerguardian" className="footer-link">GitHub</a>
          </div>
          <p className="footer-copy">© {new Date().getFullYear()} SignupDoggy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}