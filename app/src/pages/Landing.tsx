import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import { motion, useInView } from 'motion/react';

// ── Types ──
type CodeTab = 'curl' | 'node' | 'python';
type CodeLine = {
  line: string;
  indent?: boolean;
  prompt?: boolean;
  cmd?: boolean;
  key?: boolean;
  res?: boolean;
  comment?: boolean;
};

// ── Animated Counter ──
function AnimatedCounter({ from, to, suffix = '', auto = false }: { from: number; to: number; suffix?: string; auto?: boolean }) {
  const [count, setCount] = useState(from);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const started = useRef(false);

  useEffect(() => {
    const shouldStart = auto || (inView && !started.current);
    if (shouldStart && !started.current) {
      started.current = true;
      const duration = 2000;
      const steps = 60;
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

// ── BlurReveal wrapper ──
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

// ── Code content ──
const codeContent: Record<string, CodeLine[]> = {
  curl: [
    { line: 'curl -X POST https://api.signupdoggy.dev/v1/verify \\', cmd: true },
    { line: '  -H "x-api-key: $SIGNUPDOGGY_KEY" \\', key: true, indent: true },
    { line: '  -H "Content-Type: application/json" \\', key: true, indent: true },
    { line: '  -d \'{', res: true, indent: true },
    { line: '    "email": "user@10minutemail.com",', res: true, indent: true },
    { line: '    "ip": "185.220.101.45"', res: true, indent: true },
    { line: '  }\'', res: true, indent: true },
    { line: '', res: true },
    { line: '// Response', comment: true },
    { line: '{', res: true },
    { line: '  "disposable": true,', key: true, indent: true },
    { line: '  "vpn": true,', key: true, indent: true },
    { line: '  "tor": true,', key: true, indent: true },
    { line: '  "score": 0.99,', key: true, indent: true },
    { line: '  "action": "block"', key: true, indent: true },
    { line: '}', res: true },
  ],
  node: [
    { line: "import { SignupDoggy } from '@signupdoggy/sdk';", cmd: true },
    { line: '', res: true },
    { line: 'const sd = new SignupDoggy({', res: true },
    { line: "  apiKey: process.env.SIGNUPDOGGY_KEY", key: true, indent: true },
    { line: '});', res: true },
    { line: '', res: true },
    { line: '// Verify a signup request', comment: true },
    { line: 'const result = await sd.verify({', res: true },
    { line: "  email: 'user@temp-mail.org',", key: true, indent: true },
    { line: "  ip: '198.51.100.23',", key: true, indent: true },
    { line: '});', res: true },
    { line: '', res: true },
    { line: 'console.log(result);', cmd: true },
    { line: '// { disposable: true, score: 0.97, ... }', comment: true },
  ],
  python: [
    { line: 'from signupdoggy import Client', cmd: true },
    { line: '', res: true },
    { line: 'client = Client(', res: true },
    { line: '    api_key=os.environ["SIGNUPDOGGY_KEY"]', key: true, indent: true },
    { line: ')', res: true },
    { line: '', res: true },
    { line: '# Verify a signup', comment: true },
    { line: 'result = client.verify(', res: true },
    { line: "    email='user@guerrillamail.com',", key: true, indent: true },
    { line: "    ip='203.0.113.54'", key: true, indent: true },
    { line: ')', res: true },
    { line: '', res: true },
    { line: 'print(result)', cmd: true },
    { line: '# { "disposable": true, "score": 0.92 }', comment: true },
  ],
};

// ── Feature flags ──
const features = [
  {
    icon: '01',
    title: 'Disposable Email Detection',
    desc: '125,000+ known disposable domains. Real-time lookup. Catches temporary addresses before they reach your database.',
  },
  {
    icon: '02',
    title: 'VPN & Proxy Detection',
    desc: 'Detects commercial VPNs, residential proxies, and SOCKS tunnels. Flags users routing through obfuscated IPs.',
  },
  {
    icon: '03',
    title: 'Tor Exit Node Blocking',
    desc: 'Comprehensive Tor node database updated daily. Blocks signups originating from the Tor network instantly.',
  },
  {
    icon: '04',
    title: 'Phone Number Validation',
    desc: 'Real-time phone reputation checks. Detects temporary/disposable numbers and VOIP lines via global carrier data.',
  },
  {
    icon: '05',
    title: 'Risk Scoring Engine',
    desc: 'ML-powered risk aggregation. Combines email, IP, phone, device, and behavioral signals into one actionable score.',
  },
  {
    icon: '06',
    title: 'One-Click Integration',
    desc: 'Single API endpoint. Works with any stack. No webhooks, no callbacks, no complex setup. Integration in under 5 minutes.',
  },
];

const trustItems = [
  'Stripe', 'Netflix', 'Vercel', 'Supabase', 'Linear',
  'Notion', 'Railway', 'Fly.io', 'PlanetScale', 'Neon',
];

// ── Exported Component ──
export default function Landing() {
  const { loading, session } = useAuth();
  const [activeTab, setActiveTab] = useState<CodeTab>('curl');
  const [copied, setCopied] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  // Scroll-based stat trigger
  const statsInView = useInView(statsRef, { once: true, margin: '-50px' });

  const handleCopy = async () => {
    const text = codeContent[activeTab].map(l => l.line).join('\n');
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key.toLocaleLowerCase()) {
        case 'd': window.location.href = '/docs'; break;
        case 'p': window.location.href = '/pricing'; break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="crt">
      {/* ── macOS Window Chrome ── */}
      <div className="window">
        {/* Title Bar */}
        <div className="window-bar">
          <div className="window-dots">
            <span className="window-dot window-dot--close" />
            <span className="window-dot window-dot--min" />
            <span className="window-dot window-dot--max" />
          </div>
          <div className="window-url">
            <span className="lock">🔒</span>
            <span className="url-text">signupdoggy.pages.dev</span>
          </div>
          <div className="window-actions">
            <span>−</span>
            <span>□</span>
            <span>×</span>
          </div>
        </div>

        {/* ── Terminal Header / Nav ── */}
        <div className="term-header">
          <Link to="/" className="term-logo">
            <span>SD</span>
            <span className="highlight">/</span>
            <span>signupdoggy</span>
          </Link>
          <span className="term-version">v2.1.0</span>
          <nav className="term-nav">
            <a href="#features" className="active">FEATURES</a>
            <a href="/docs">DOCS</a>
            <a href="/pricing">PRICING</a>
            {!loading && session ? (
              <Link to="/dashboard" className="btn-nav">DASHBOARD</Link>
            ) : (
              <Link to="/auth" className="btn-nav">GET STARTED →</Link>
            )}
          </nav>
        </div>

        {/* ── Main Content ── */}
        <div className="window-body">
          {/* ═══ HERO ═══ */}
          <section className="hero">
            <div className="hero-inner">
              <div className="hero-badge">
                <span className="blink" />
                NOW IN PUBLIC BETA · FREE TIER AVAILABLE
              </div>

              <h1>
                STOP{' '}
                <span className="highlight">FAKE</span>{' '}
                SIGNUPS{' '}
                <span className="highlight">BEFORE</span>{' '}
                THEY HAPPEN
                <span className="cursor" />
              </h1>

              <p className="hero-sub">
                One API call detects disposable emails, VPN proxies, Tor exit nodes,
                and virtual phones. Free tier included. No sales call required.
              </p>

              <div className="hero-cta">
                <Link to="/auth" className="btn-terminal">
                  <span className="prompt">$</span>
                  ./start-free
                </Link>
                <a href="#code" className="btn-terminal btn-terminal--outline">
                  <span className="prompt">&gt;</span>
                  view-docs
                </a>
              </div>

              {/* Stats */}
              <div className="hero-stats">
                <div className="hero-stat">
                  <span className="value">
                    <AnimatedCounter from={0} to={12456000} suffix="+" auto />
                  </span>
                  <span className="label">Emails Blocked</span>
                </div>
                <div className="hero-stat">
                  <span className="value">
                    <AnimatedCounter from={0} to={125000} suffix="+" auto />
                  </span>
                  <span className="label">VPN/Proxy Detected</span>
                </div>
                <div className="hero-stat">
                  <span className="value">
                    <AnimatedCounter from={0} to={124000} suffix="+" auto />
                  </span>
                  <span className="label">Phones Blocked</span>
                </div>
              </div>
            </div>
          </section>

          {/* ═══ CODE TERMINAL ═══ */}
          <div className="code-terminal" id="code">
            <div className="term-head">
              <div className="dots">
                <span className="dot dot--r" />
                <span className="dot dot--y" />
                <span className="dot dot--g" />
              </div>
              <span className="title">api@detect:~$ ./verify.sh</span>
            </div>
            <div className="term-body" style={{ position: 'relative' }}>
              <div className="tab-bar">
                {(['curl', 'node', 'python'] as CodeTab[]).map(tab => (
                  <button
                    key={tab}
                    className={`tab ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === 'curl' ? 'cURL' : tab === 'node' ? 'Node.js' : 'Python'}
                  </button>
                ))}
              </div>
              <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
                {copied ? 'COPIED' : 'COPY'}
              </button>
              {codeContent[activeTab].map((l, i) => (
                <span key={i} className={`term-line ${l.indent ? 'indent' : ''}`}>
                  {l.prompt && <span className="prompt-symbol">❯ </span>}
                  {l.cmd && <span className="cmd">{l.line}</span>}
                  {l.key && <span className="key">{l.line}</span>}
                  {l.res && <span className="res">{l.line}</span>}
                  {l.comment && <span className="comment">{l.line}</span>}
                </span>
              ))}
            </div>
          </div>

          {/* ═══ TRUST BAR ═══ */}
          <div className="trust-bar">
            <div className="trust-label">Trusted by engineering teams</div>
            <div className="trust-track">
              {[...trustItems, ...trustItems].map((item, i) => (
                <span key={i} className="trust-item">{item}</span>
              ))}
            </div>
          </div>

          {/* ═══ FEATURES ═══ */}
          <section className="features" id="features">
            <BlurReveal>
              <div className="section-header">
                <span className="prefix">Capabilities</span>
                <h2>What You Get</h2>
                <p className="sub">
                  Every tool you need to eliminate fake signups from your platform.
                  No bloat. Just results.
                </p>
              </div>
            </BlurReveal>

            <div className="features-grid">
              {features.map((f, i) => (
                <BlurReveal key={i} delay={0.1 * i}>
                  <div className="feature-card">
                    <div className="top-accent" />
                    <div className="icon-wrap">{f.icon}</div>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                </BlurReveal>
              ))}
            </div>
          </section>

          {/* ═══ STATS STRIP ═══ */}
          <div className="stats-strip" ref={statsRef}>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-val">
                  <AnimatedCounter from={0} to={500} suffix="+" />
                </span>
                <span className="stat-label">Happy Customers</span>
              </div>
              <div className="stat-item">
                <span className="stat-val">
                  <AnimatedCounter from={0} to={99} suffix=".9%" />
                </span>
                <span className="stat-label">Uptime</span>
              </div>
              <div className="stat-item">
                <span className="stat-val">
                  <AnimatedCounter from={0} to={25} suffix="ms" />
                </span>
                <span className="stat-label">Avg Latency</span>
              </div>
              <div className="stat-item">
                <span className="stat-val">
                  <AnimatedCounter from={0} to={10} suffix="K+" />
                </span>
                <span className="stat-label">API Requests / Day</span>
              </div>
            </div>
          </div>

          {/* ═══ CTA ═══ */}
          <section className="cta-section">
            <div className="prompt-line">
              <span className="green">$</span> ./build --deploy=production
            </div>
            <h2>Ready to Ship with Confidence?</h2>
            <p>
              Free tier includes 500 API calls/month. No credit card. No sales call.
              No nonsense.
            </p>
            <div className="cta-buttons">
              <Link to="/auth" className="btn-terminal">
                <span className="prompt">$</span>
                deploy-now
              </Link>
              <a href="/docs" className="btn-terminal btn-terminal--outline">
                <span className="prompt">&gt;</span>
                read-docs
              </a>
            </div>
          </section>

          {/* ═══ FOOTER ═══ */}
          <footer className="terminal-footer">
            <div className="status">
              <span className="status-dot" />
              <span>STATUS: OPERATIONAL</span>
            </div>
            <span className="section-divider">|</span>
            <span>SIGNUPDOGGY v2.1.0 · 2026</span>
            <span className="section-divider">|</span>
            <div className="keybind">
              <span>[<kbd>D</kbd>] <a href="/docs">Docs</a></span>
              <span>[<kbd>P</kbd>] <a href="/pricing">Pricing</a></span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
