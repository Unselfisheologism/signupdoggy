import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth';
import Landing from './pages/Landing';
import Docs from './pages/Docs';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ApiKeys from './pages/ApiKeys';

const DARK_ROUTES = ['/login', '/signup', '/dashboard', '/keys'];

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isDark = DARK_ROUTES.includes(location.pathname);

  return (
    <nav className={'navbar' + (isDark ? ' dark' : '')}>
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">SD</span>
          SignupDoggy
        </Link>
        <div className="nav-links">
          <Link to="/pricing">Pricing</Link>
          <Link to="/docs">Docs</Link>
          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/keys">Keys</Link>
              <span className="nav-user">{user.email}</span>
              <button onClick={logout} className="btn btn-sm">Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-sm">Log in</Link>
              <Link to="/signup" className="btn btn-sm btn-primary">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen dark"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="app">
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/keys" element={<RequireAuth><ApiKeys /></RequireAuth>} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
