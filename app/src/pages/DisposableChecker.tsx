// Free disposable-email checker tool — runs entirely in the browser.
// The blocklist is embedded in the JS bundle. ~32 KB uncompressed.
// For the full 200,000-domain list, use the SignupDoggy /v1/check API.

import { useState, useMemo } from 'react';
import AppLayout from '../components/AppLayout';
import { SEO } from '../components/SEO';
import { DISPOSABLE_DOMAINS, ROLE_BASED_LOCAL_PARTS, FREE_EMAIL_PROVIDERS } from '../lib/disposableDomains';
import type { SeoConfig } from '../lib/seoConfig';
import { DISPOSABLE_CHECKER_BODY } from '../lib/disposableCheckerBody';

interface CheckResult {
  email: string;
  domain: string;
  localPart: string;
  isDisposable: boolean;
  isRoleBased: boolean;
  isFreeProvider: boolean;
  verdict: 'safe' | 'caution' | 'disposable';
}

function classifyEmail(rawEmail: string): CheckResult | null {
  const email = rawEmail.trim().toLowerCase();
  if (!email || !email.includes('@')) return null;
  const at = email.lastIndexOf('@');
  const localPart = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (!localPart || !domain || !domain.includes('.')) return null;

  const isDisposable = DISPOSABLE_DOMAINS.has(domain);
  const isRoleBased = ROLE_BASED_LOCAL_PARTS.has(localPart);
  const isFreeProvider = FREE_EMAIL_PROVIDERS.has(domain);

  let verdict: 'safe' | 'caution' | 'disposable';
  if (isDisposable) verdict = 'disposable';
  else if (isRoleBased) verdict = 'caution';
  else if (isFreeProvider) verdict = 'caution';
  else verdict = 'safe';

  return { email, domain, localPart, isDisposable, isRoleBased, isFreeProvider, verdict };
}

interface Props {
  config: SeoConfig;
}

export default function DisposableChecker({ config }: Props) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const examples = useMemo(
    () => [
      'someone@gmail.com',
      'admin@tempmail.com',
      'founder@stripe.com',
      'newsletter@mailchimp.com',
    ],
    [],
  );

  const handleCheck = (overrideEmail?: string) => {
    const emailToCheck = overrideEmail ?? input;
    if (!emailToCheck.trim()) {
      setError('Type an email address first.');
      return;
    }
    const r = classifyEmail(emailToCheck);
    if (!r) {
      setError('That doesn\'t look like a valid email address.');
      setResult(null);
      return;
    }
    setResult(r);
    setError(null);
    if (!history.includes(r.email)) {
      setHistory([r.email, ...history].slice(0, 5));
    }
  };

  const verdictColor = result?.verdict === 'safe' ? '#3ecf8e' : result?.verdict === 'caution' ? '#f5a623' : '#ff6b6b';
  const verdictLabel = result?.verdict === 'safe' ? 'Looks like a real inbox' : result?.verdict === 'caution' ? 'Worth a second look' : 'Disposable / temporary email';
  const verdictIcon = result?.verdict === 'safe' ? '✓' : result?.verdict === 'caution' ? '!' : '✕';

  return (
    <AppLayout>
      <SEO config={config} />
      <div className="page-content">
        <div className="term-banner">
          <span className="banner-prompt">$</span> ./tools/disposable-email-checker --check
          <span className="banner-status">● FREE TOOL</span>
        </div>

        <header style={{ marginBottom: 'var(--space-xl)' }}>
          <h1 className="docs-h1" style={{ marginTop: 'var(--space-md)' }}>Disposable Email Checker</h1>
          <p className="docs-lead">
            Free, instant, in your browser. Type an email — get a verdict.
            No signup, no API key, no tracking. The check runs entirely client-side.
          </p>
        </header>

        {/* ═══ THE TOOL ═══ */}
        <section className="docs-section" style={{ background: 'var(--bg-elevated)', padding: 'var(--space-2xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-faint)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
            <input
              type="email"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
              placeholder="someone@example.com"
              autoFocus
              style={{
                flex: 1,
                minWidth: '280px',
                padding: '14px 18px',
                fontSize: '18px',
                fontFamily: 'var(--font-mono, monospace)',
                background: 'var(--bg-base)',
                border: '2px solid var(--border-faint)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
              aria-label="Email address to check"
            />
            <button
              type="button"
              onClick={() => handleCheck()}
              className="cta-button"
              style={{ padding: '14px 32px', fontSize: '16px', whiteSpace: 'nowrap' }}
            >
              Check
            </button>
          </div>

          {error && (
            <p style={{ color: '#ff6b6b', marginTop: 'var(--space-md)', fontSize: '14px' }} role="alert">
              {error}
            </p>
          )}

          <div style={{ marginTop: 'var(--space-md)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginRight: 'var(--space-sm)' }}>try:</span>
            {examples.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => { setInput(ex); handleCheck(ex); }}
                style={{
                  fontSize: '12px',
                  padding: '4px 10px',
                  background: 'transparent',
                  border: '1px solid var(--border-faint)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              >
                {ex}
              </button>
            ))}
          </div>

          {result && (
            <div
              style={{
                marginTop: 'var(--space-xl)',
                padding: 'var(--space-xl)',
                background: 'var(--bg-base)',
                border: `2px solid ${verdictColor}`,
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: verdictColor,
                    color: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                  aria-hidden
                >
                  {verdictIcon}
                </div>
                <div>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                    Verdict
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 600, color: verdictColor }}>{verdictLabel}</div>
                </div>
              </div>

              <dl style={{ marginTop: 'var(--space-lg)', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'var(--space-sm) var(--space-lg)', fontSize: '14px', fontFamily: 'var(--font-mono, monospace)' }}>
                <dt style={{ color: 'var(--text-muted)' }}>email:</dt>
                <dd style={{ color: 'var(--text-primary)' }}>{result.email}</dd>
                <dt style={{ color: 'var(--text-muted)' }}>domain:</dt>
                <dd style={{ color: 'var(--text-primary)' }}>{result.domain}</dd>
                <dt style={{ color: 'var(--text-muted)' }}>local:</dt>
                <dd style={{ color: 'var(--text-primary)' }}>{result.localPart}</dd>
                <dt style={{ color: 'var(--text-muted)' }}>in disposable blocklist:</dt>
                <dd style={{ color: result.isDisposable ? '#ff6b6b' : 'var(--text-primary)' }}>{result.isDisposable ? 'yes' : 'no'}</dd>
                <dt style={{ color: 'var(--text-muted)' }}>is role-based (admin@ etc):</dt>
                <dd style={{ color: result.isRoleBased ? '#f5a623' : 'var(--text-primary)' }}>{result.isRoleBased ? 'yes' : 'no'}</dd>
                <dt style={{ color: 'var(--text-muted)' }}>is free provider (gmail etc):</dt>
                <dd style={{ color: result.isFreeProvider ? '#f5a623' : 'var(--text-primary)' }}>{result.isFreeProvider ? 'yes' : 'no'}</dd>
              </dl>

              {result.isDisposable && (
                <div style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-md)', background: 'rgba(255, 107, 107, 0.1)', borderRadius: 'var(--radius-md)' }}>
                  <strong style={{ color: '#ff6b6b' }}>{result.domain}</strong> is a known disposable-email provider.
                  A signup from this address is almost certainly a bot, a free-trial abuser, or a user who will
                  never see your verification email. Reject it.
                </div>
              )}
              {result.isRoleBased && !result.isDisposable && (
                <div style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-md)', background: 'rgba(245, 166, 35, 0.1)', borderRadius: 'var(--radius-md)' }}>
                  <strong style={{ color: '#f5a623' }}>{result.localPart}@{result.domain}</strong> is a shared mailbox
                  ({result.localPart}@), not a personal inbox. Signups from these addresses rarely convert.
                </div>
              )}
              {result.isFreeProvider && !result.isDisposable && !result.isRoleBased && (
                <div style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-md)', background: 'rgba(245, 166, 35, 0.05)', borderRadius: 'var(--radius-md)' }}>
                  Free email provider. The email is likely real, but if you target B2B, consider requiring a
                  work email.
                </div>
              )}
            </div>
          )}

          {history.length > 0 && (
            <div style={{ marginTop: 'var(--space-lg)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 'var(--space-xs)' }}>recent checks (this session, not stored):</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                {history.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => { setInput(h); handleCheck(h); }}
                    style={{
                      fontSize: '12px',
                      padding: '4px 10px',
                      background: 'transparent',
                      border: '1px solid var(--border-faint)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono, monospace)',
                    }}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ═══ EDUCATIONAL CONTENT (also serves SEO + GEO) ═══ */}
        <section className="docs-section" style={{ marginTop: 'var(--space-3xl)' }}>
          <article className="blog-post-body">
            <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'system-ui', fontSize: '15px', lineHeight: '1.6' }}>
              {DISPOSABLE_CHECKER_BODY}
            </div>
          </article>
        </section>

        {/* ═══ CTA ═══ */}
        <section style={{ marginTop: 'var(--space-3xl)', padding: 'var(--space-xl) 0', borderTop: '1px solid var(--border-faint)' }}>
          <h2 className="docs-h2">Check every signup automatically</h2>
          <p className="docs-p">
            The free tool checks one email at a time. For your SaaS, the same blocklist is available as a single
            API call. $0.01 per check. $5 minimum, credits never expire.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)', flexWrap: 'wrap' }}>
            <a className="cta-button" href="/signup" rel="nofollow">Get a free API key</a>
            <a className="cta-button secondary" href="/docs">Read the API docs</a>
            <a className="cta-button secondary" href="/blog/disposable-email-detection-nodejs-tutorial">Node.js tutorial</a>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
