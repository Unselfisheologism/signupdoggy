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
      switch (e.key.toLocaleLowerCase()) {
        case 'd': navigate('/docs'); break;
        case 'p': navigate('/pricing'); break;
        case 'g': navigate(session ? '/dashboard' : '/auth'); break;
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
        )}
      </div>
    </div>
  );
}
