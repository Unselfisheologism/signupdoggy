import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { useEffect } from 'react';

interface NavItem {
  path: string;
  label: string;
  accent?: boolean;
}

const defaultNav: NavItem[] = [
  { path: '/', label: 'HOME' },
  { path: '/docs', label: 'DOCS' },
  { path: '/pricing', label: 'PRICING', accent: true },
];

const dashNav: NavItem[] = [
  { path: '/dashboard', label: 'DASHBOARD' },
  { path: '/keys', label: 'API KEYS' },
  { path: '/docs', label: 'DOCS' },
  { path: '/pricing', label: 'PRICING', accent: true },
];

export default function AppLayout({
  children,
  navItems,
}: {
  children: React.ReactNode;
  navItems?: NavItem[];
}) {
  const { loading, session, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === '/';
  const nav = navItems || (session && !isLanding ? dashNav : defaultNav);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return; // don't hijack browser shortcuts
      switch (e.key.toLocaleLowerCase()) {
        case 'd': navigate('/docs'); break;
        case 'p': navigate('/pricing'); break;
        case 'b': navigate('/blog'); break;
        case 't': navigate('/terms'); break;
        case 'v': navigate('/privacy'); break;
        case 'g': navigate(session ? '/dashboard' : '/auth'); break;
        case 'm': window.location.href = 'mailto:jeffrinjames99@gmail.com'; break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [navigate, session]);

  return (
    <div className="crt">
      <div className="window" style={{ minHeight: '100dvh', margin: isLanding ? 'var(--space-lg) auto' : '0 auto' }}>

        {/* Terminal Header / Nav */}
        <div className="term-header">
          <Link to="/" className="term-logo">
            <span>SD</span>
            <span className="highlight">/</span>
            <span>signupdoggy</span>
          </Link>
          <span className="term-version">v2.1.0</span>
          <nav className="term-nav">
            {nav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={[
                  location.pathname === item.path ? 'active' : '',
                  item.accent ? 'term-pricing-link' : '',
                ].filter(Boolean).join(' ')}
              >
                {item.label}
              </Link>
            ))}
            {!loading && session && !isLanding ? (
              <button
                type="button"
                className="btn-nav"
                onClick={handleLogout}
                aria-label="Log out of your account"
              >
                LOGOUT
              </button>
            ) : !loading && !session && !isLanding ? (
              <Link to="/auth" className="btn-nav">GET MY API KEY</Link>
            ) : null}
          </nav>
        </div>

        {/* Page Content */}
        <div className="window-body" style={isLanding ? {} : { padding: 'var(--space-xl) var(--space-lg)' }}>
          {children}
        </div>

        {/* Footer */}
        {!isLanding && (
          <footer className="terminal-footer terminal-footer--share">
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
                          <div className="keybind">
                            <Link to="/docs" className="keybind-link"><kbd>D</kbd> DOCS</Link>
                            <Link to="/pricing" className="keybind-link"><kbd>P</kbd> PRICING</Link>
                            <Link to="/blog" className="keybind-link"><kbd>B</kbd> BLOG</Link>
                            <Link to="/topics" className="keybind-link"><kbd>O</kbd> TOPICS</Link>
                            <Link to="/disposable-checker" className="keybind-link">FREE CHECKER</Link>
                            <Link to="/glossary" className="keybind-link">GLOSSARY</Link>
                            <Link to="/alternatives" className="keybind-link">ALTERNATIVES</Link>
                            <Link to="/author/jeffrin-james" className="keybind-link">AUTHOR</Link>
                            <a href="mailto:jeffrinjames99@gmail.com" className="keybind-link"><kbd>M</kbd> EMAIL</a>
                            <Link to={session ? '/dashboard' : '/auth'} className="keybind-link"><kbd>G</kbd> {session ? 'DASHBOARD' : 'GET MY API KEY'}</Link>
                          </div>
                        </div>
            <div className="footer-credit">
              $ ./whoami → jeffrin-james, mumbai, india, indie hacker
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
