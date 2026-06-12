import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

interface ApiKey {
  key: string;
  user_id: string;
  tier: string;
  created: string;
}

export default function ApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      const { data, error: dbErr } = await supabase
        .from('api_keys')
        .select('*')
        .order('created', { ascending: false });
      if (dbErr) throw dbErr;
      setKeys((data as ApiKey[]) || []);
    } catch {
      setError('Could not load API keys.');
    }
    setLoading(false);
  };

  const createKey = async () => {
    setCreating(true);
    setError('');
    setNewKey(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const raw = await fetch(
        'https://signupdoggy-portal-api.jeffrinjames99.workers.dev/api/keys',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: user.id }),
        }
      );
      if (!raw.ok) throw new Error('Failed to create key');
      const result = await raw.json();
      setNewKey(result.key);
      await loadKeys();
    } catch (err: any) {
      setError(err.message || 'Failed to create key.');
    }
    setCreating(false);
  };

  const deleteKey = async (key: string) => {
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await fetch(
        `https://signupdoggy-portal-api.jeffrinjames99.workers.dev/api/keys/${key}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        }
      );
      await loadKeys();
    } catch {
      setError('Failed to delete key.');
    }
  };

  return (
    <div className="keys-page">
      <h1>API Keys</h1>
      <p className="keys-sub">
        These keys authenticate your API requests. Keep them secret.
      </p>

      {error && <div className="error-msg">{error}</div>}

      {newKey && (
        <div className="new-key-box">
          <div className="new-key-warn">Save this key. It will not be shown again.</div>
          <div className="key-display-box">{newKey}</div>
          <button
            className="btn btn-sm"
            onClick={() => {
              navigator.clipboard.writeText(newKey);
            }}
          >
            Copy to clipboard
          </button>
        </div>
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <button
          className="btn btn-primary"
          onClick={createKey}
          disabled={creating}
        >
          {creating ? 'Creating...' : 'Create new key'}
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '2rem 0' }}><div className="spinner" /></div>
      ) : keys.length === 0 ? (
        <p style={{ color: 'var(--text2-dark)', fontSize: '0.9rem' }}>
          No API keys yet. Create one to get started.
        </p>
      ) : (
        keys.map((k) => (
          <div key={k.key} className="key-card">
            <div className="key-info">
              <div className="key-value">{k.key}</div>
              <div className="key-meta">
                {k.tier} tier &middot; Created{' '}
                {new Date(k.created).toLocaleDateString()}
              </div>
            </div>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => deleteKey(k.key)}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}
