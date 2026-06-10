import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../api';
import { useAuth } from '../auth';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const data = await signup(email, password, name);
      setAuth(data.user, data.token);
      setSuccess(`API key created: ${data.api_key.key} — save it now, it won't be shown again!`);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <h1>Create your account</h1>
      <p className="sub">Get your API key in under 30 seconds</p>
      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="At least 6 characters" />
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account & get API key'}
        </button>
      </form>
      <div className="auth-link">
        Already have an account? <Link to="/login">Log in</Link>
      </div>
    </div>
  );
}
