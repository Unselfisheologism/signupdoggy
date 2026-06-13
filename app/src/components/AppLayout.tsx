import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { useEffect } from 'react';

interface NavItem {
  path: string;
  label: string;
}

const defaultNav: NavItem[] = [
  { path: '/', label: 'HOME' },
  { path: '/docs', label: 'DOCS' },
  { path: '/pricing', label: 'PRICING' },
];

const dashNav: NavItem[] = [
  { path: '/dashboard', label: 'DASHBOARD' },
  { path: '/keys', label: 'API KEYS' },
  { path: '/docs', label: 'DOCS' },
  { path: '/pricing', label: 'PRICING' },
];

export default function AppLayout({
  children,
  navItems,
  title = 'signupdoggy.pages.dev',
}: {
  children: React.ReactNode;
  navItems?: NavItem[];
  title?: string;
}) {
  const { loading, session, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === '/';
  const nav = navItems || (session && !isLanding ? dashNav : defaultNav);

  const handleLogout = async () => {
    await logout();
    // signOut() resolves and clears the Supabase session + storage; the local
    // user/session state is reset by logout() itself, so RequireAuth won't
    // bounce us back. Send the user to the landing page.
    navigate('/', { replace: true });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key.toLocaleLowerCase()) {
        case 'd': navigate('/docs'); break;
        case 'p': navigate('/pricing'); break;
        case 'f': navigate('/#features'); break;
        case 'g': navigate('/auth'); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [navigate]);

  return (
    <div className="crt">
      <div className="window" style={{ minHeight: '100dvh', margin: isLanding ? 'var(--space-lg) auto' : '0 auto' }}>
        {/* Title Bar */}
        <div className="window-bar">
          <div className="window-dots">
            <span className="window-dot window-dot--close" />
            <span className="window-dot window-dot--min" />
            <span className="window-dot window-dot--max" />
          </div>
          <div className="window-url">
            <span className="lock">🔒</span>
            <span className="url-text">{title}</span>
          </div>
          <div className="window-actions">
            <span>−</span>
            <span>□</span>
            <span>×</span>
          </div>
        </div>

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
                className={location.pathname === item.path ? 'active' : ''}
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
              <Link to="/auth" className="btn-nav">SIGN IN</Link>
            ) : null}
          </nav>
        </div>

        {/* Page Content */}
        <div className="window-body" style={isLanding ? {} : { padding: 'var(--space-xl) var(--space-lg)' }}>
          {children}
        </div>

        {/* Footer (only on non-landing pages) */}
        {!isLanding && (
          <footer className="terminal-footer" style={{ borderTop: 'var(--border-thin) solid var(--border-dim)' }}>
            <div className="status">
              <span className="status-dot" />
              <span>STATUS: OPERATIONAL</span>
            </div>
            <span className="section-divider">|</span>
            <span>SIGNUPDOGGY v2.1.0 · 2026</span>
            <span className="section-divider">|</span>
            <div className="keybind">
              <span>[<kbd>F</kbd>] <a href="/#features">Features</a></span>
              <span>[<kbd>D</kbd>] <a href="/docs">Docs</a></span>
              <span>[<kbd>P</kbd>] <a href="/pricing">Pricing</a></span>
              <span>[<kbd>G</kbd>] <a href="/auth">Get Started</a></span>
            </div>
            <span className="section-divider">|</span>
            <div className="keybind">
              <span><Link to="/terms">TERMS</Link></span>
              <span><Link to="/privacy">PRIVACY</Link></span>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
