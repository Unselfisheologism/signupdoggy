import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { createKey } from '../api';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'key'>('form');
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) throw error;
      if (!data.user) throw new Error('Signup failed');

      // Create first API key via portal API
      const keyResult = await createKey();
      setApiKey(keyResult.key);
      setStep('key');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'key') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>🎉 Account created!</h1>
          <p className="sub">Save your API key — it will not be shown again.</p>
          <div className="new-key-box">
            <p
              style={{
                color: 'var(--accent)',
                fontWeight: 600,
                marginBottom: '0.5rem',
              }}
            >
              ⚠️ Save this key — it will not be shown again!
            </p>
            <div className="key-display-box">
              <code>{apiKey}</code>
            </div>
            <div className="btn-group" style={{ marginTop: '0.75rem' }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigator.clipboard.writeText(apiKey)}
              >
                📋 Copy Key
              </button>
            </div>
          </div>
          <p className="sub" style={{ marginTop: 12 }}>
            You can always create new keys from the dashboard.
          </p>
          <button
            className="btn btn-primary btn-block"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create your account</h1>
        <p className="sub">Get your API key in under 30 seconds</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading
              ? 'Creating account...'
              : 'Create account & get API key'}
          </button>
        </form>
        <div className="auth-link">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
