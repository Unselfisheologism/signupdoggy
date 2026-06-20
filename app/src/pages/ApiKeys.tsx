import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { listKeys, createKey, deleteKey, type ApiKey } from '../api';
import { WarnIcon } from '../components/icons';

// Each key in the list comes back from the portal API as `{ key: "sd_xxxxxxxxxxxx..." }` —
// only the first 12 characters plus a literal "..." ellipsis. The full key is stored in
// KV at creation time but NEVER returned after that (Stripe/GitHub/AWS pattern).
//
// This component is honest about that. The "COPY" button is gone — replaced with
// "COPY ID" which copies just the prefix. A prominent note explains that the full key
// is only available at creation. To get a fresh full key, the user deletes this one
// and creates a new one.
function KeyDisplay({ apiKey, onDelete }: { apiKey: ApiKey; onDelete: (key: string) => void }) {
  const [copied, setCopied] = useState(false);
  // The displayed string ends with "..." — strip it before copying so the clipboard
  // contains only the real prefix, not "sd_xyz......." which is useless.
  const realPrefix = apiKey.key.replace(/\.+$/, '');
  const handleCopy = () => {
    navigator.clipboard.writeText(realPrefix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleReveal = () => {
    // Best-effort: log the prefix to the console so the user can copy from there
    // if they want the full key (useful for support/debugging — not for normal use).
    console.info(`[SignupDoggy] API key prefix: ${realPrefix}`);
    alert(
      `The full API key was shown ONCE when this key was created.\n\n` +
      `For security, we never store or return the full key after that.\n\n` +
      `To get a fresh full key, delete this one and create a new one.\n\n` +
      `(The prefix ${realPrefix} has been logged to the browser console for reference.)`
    );
  };
  return (
    <div className="key-card">
      <div className="key-info">
        <div className="key-value">
          <span className="key-marker">●</span>
          {apiKey.key}
        </div>
        <div className="key-meta">
          <span className="key-tier">PAY-AS-YOU-GO</span>
          <span className="key-sep">|</span>
          <span>CREATED {new Date(apiKey.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</span>
          {apiKey.usage_today > 0 && (
            <>
              <span className="key-sep">|</span>
              <span>{apiKey.usage_today} REQUEST{apiKey.usage_today !== 1 ? 'S' : ''} TODAY</span>
            </>
          )}
        </div>
        <div className="key-note">
          ⚠ Full key was shown once at creation. If you lost it, delete this key and create a new one.
        </div>
      </div>
      <div className="key-actions">
        <button className="btn-key btn-key--copy" onClick={handleCopy} title={`Copies just the prefix (${realPrefix}) — not the full secret`}>
          [{copied ? 'COPIED' : 'COPY ID'}]
        </button>
        <button className="btn-key btn-key--info" onClick={handleReveal} title="Why can't I see the full key?">
          [WHY?]
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

  const handleDeleteKey = async (displayedKey: string) => {
    setError('');
    try {
      // The display includes a trailing '...' for truncation, but the real
      // key in KV contains no dots. The Worker's prefix-match only works
      // against the actual key, so strip the ellipsis before sending.
      const prefix = displayedKey.replace(/\.\.\.$/, '');
      await deleteKey(prefix);
      await loadKeys();
    } catch (err: any) {
      console.error('deleteKey failed:', err);
      setError(err?.message || 'Failed to delete key.');
    }
  };

  return (
    <AppLayout>
      <div className="page-content">
        <div className="term-banner">
          <span className="banner-prompt">$</span> ./keys --list
          <span className="banner-status">● {keys.length} KEY{keys.length !== 1 ? 'S' : ''}</span>
        </div>

        {error && <div className="error-msg retro-error">! {error}</div>}

        {newKey && (
          <div className="new-key-box">
            <div className="new-key-warn">
              <WarnIcon style={{ verticalAlign: '-2px', marginRight: 6 }} /> SAVE THIS KEY. IT WILL NOT BE SHOWN AGAIN.
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
