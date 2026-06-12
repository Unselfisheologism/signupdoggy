import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { listKeys, createKey, deleteKey, type ApiKey } from '../api';

function KeyDisplay({ apiKey, onDelete }: { apiKey: ApiKey; onDelete: (key: string) => void }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="key-card">
      <div className="key-info">
        <div className="key-value">
          <span className="key-marker">●</span>
          {apiKey.key}
        </div>
        <div className="key-meta">
          <span className="key-tier">FREE TIER</span>
          <span className="key-sep">|</span>
          <span>CREATED {new Date(apiKey.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</span>
          {apiKey.usage_today > 0 && (
            <>
              <span className="key-sep">|</span>
              <span>{apiKey.usage_today} REQUEST{apiKey.usage_today !== 1 ? 'S' : ''} TODAY</span>
            </>
          )}
        </div>
      </div>
      <div className="key-actions">
        <button className="btn-key btn-key--copy" onClick={handleCopy}>
          [{copied ? 'COPIED' : 'COPY'}]
        </button>
        <button className="btn-key btn-key--delete" onClick={() => onDelete(apiKey.key)}>
          [DELETE]
        </button>
      </div>
    </div>
  );
}

export default function ApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => { loadKeys(); }, []);

  const loadKeys = async () => {
    try {
      const { keys } = await listKeys();
      setKeys(keys || []);
    } catch (err: any) {
      console.error('loadKeys failed:', err);
      setError(err?.message || 'Could not load API keys.');
    }
    setLoading(false);
  };

  const handleCreateKey = async () => {
    setCreating(true);
    setError('');
    setNewKey(null);
    try {
      const result = await createKey();
      setNewKey(result.key);
      await loadKeys();
    } catch (err: any) {
      console.error('createKey failed:', err);
      setError(err?.message || 'Failed to create key.');
    }
    setCreating(false);
  };

  const handleDeleteKey = async (prefix: string) => {
    setError('');
    try {
      await deleteKey(prefix);
      await loadKeys();
    } catch (err: any) {
      console.error('deleteKey failed:', err);
      setError(err?.message || 'Failed to delete key.');
    }
  };

  return (
    <AppLayout title="keys.signupdoggy.pages.dev">
      <div className="page-content">
        <div className="term-banner">
          <span className="banner-prompt">$</span> ./keys --list
          <span className="banner-status">● {keys.length} KEY{keys.length !== 1 ? 'S' : ''}</span>
        </div>

        {error && <div className="error-msg retro-error">! {error}</div>}

        {newKey && (
          <div className="new-key-box">
            <div className="new-key-warn">
              ⚠ SAVE THIS KEY. IT WILL NOT BE SHOWN AGAIN.
            </div>
            <div className="key-display-box">{newKey}</div>
            <button
              className="btn-key btn-key--copy"
              onClick={() => { navigator.clipboard.writeText(newKey); }}
            >
              [COPY TO CLIPBOARD]
            </button>
          </div>
        )}

        <div className="keys-toolbar">
          <button
            className="btn-key btn-key--create"
            onClick={handleCreateKey}
            disabled={creating}
          >
            {creating ? '[CREATING...]' : '[CREATE NEW KEY]'}
          </button>
        </div>

        {loading ? (
          <div className="loading-row">
            <span className="loading-dots">LOADING<span className="dots-anim">...</span></span>
          </div>
        ) : keys.length === 0 ? (
          <div className="keys-empty">
            <span className="keys-empty-icon">◇</span>
            <span className="keys-empty-text">NO API KEYS YET. CREATE ONE TO GET STARTED.</span>
          </div>
        ) : (
          <div className="keys-list">
            {keys.map((k) => (
              <KeyDisplay key={k.key} apiKey={k} onDelete={handleDeleteKey} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
