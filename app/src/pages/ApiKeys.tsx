import { useEffect, useState } from 'react';
import { useAuth } from '../auth';
import { listKeys, createKey as apiCreateKey, deleteKey as apiDeleteKey, type ApiKey } from '../api';

export default function ApiKeys() {
  const { token } = useAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');

  async function loadKeys() {
    if (!token) return;
    try {
      const data = await listKeys(token);
      setKeys(data.keys);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadKeys(); }, [token]);

  async function handleCreate() {
    if (!token) return;
    setError('');
    try {
      const data = await apiCreateKey(token);
      setNewKey(data.key);
      setShowNew(true);
      await loadKeys();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete(prefix: string) {
    if (!token || !confirm('Revoke this API key? This cannot be undone.')) return;
    setError('');
    try {
      await apiDeleteKey(token, prefix);
      setKeys(keys.filter(k => !k.key.startsWith(prefix)));
    } catch (err: any) {
      setError(err.message);
    }
  }

  function dismissNewKey() {
    setShowNew(false);
    setNewKey('');
  }

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="keys-page">
      <h1>API Keys</h1>
      <p className="sub">Create and manage API keys for your applications.</p>

      {error && <div className="error-msg">{error}</div>}

      {showNew && (
        <div className="new-key-box">
          <p style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '0.5rem' }}>⚠️ Save this key — it will not be shown again!</p>
          <pre><code>{newKey}</code></pre>
          <div className="btn-group" style={{ marginTop: '0.75rem' }}>
            <button className="btn btn-primary btn-sm" onClick={() => { navigator.clipboard.writeText(newKey); }}>📋 Copy Key</button>
            <button className="btn btn-sm" onClick={dismissNewKey}>Dismiss</button>
          </div>
        </div>
      )}

      <button className="btn btn-primary" onClick={handleCreate} style={{ marginBottom: '1.5rem' }}>
        + Create New Key
      </button>

      <div>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text2)' }}>Your Keys</h3>
        {keys.length === 0 ? (
          <p style={{ color: 'var(--text3)' }}>No API keys yet. Create one to get started.</p>
        ) : (
          keys.map(k => (
            <div key={k.key} className="key-card">
              <div className="key-info">
                <div className="key-value"><code>{k.key}</code></div>
                <div className="key-meta">Created {k.created} · {k.usage_today} requests today</div>
              </div>
              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(k.key.split('-')[0])}>Revoke</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
