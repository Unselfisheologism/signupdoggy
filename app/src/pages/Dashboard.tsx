import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import AppLayout from '../components/AppLayout';
import { getUsage, listKeys, getCredits, type UsageDay } from '../api';
import { ArrowRightIcon } from '../components/icons';

function formatDayLabel(iso: string): string {
  // iso is 'YYYY-MM-DD'
  const [, m, d] = iso.split('-');
  const monthIdx = parseInt(m, 10) - 1;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[monthIdx]} ${parseInt(d, 10)}`;
}

function num(n: number): string {
  return n.toLocaleString('en-US');
}

export default function Dashboard() {
  const { user } = useAuth();
  const [days, setDays] = useState<UsageDay[] | null>(null);
  const [hasKeys, setHasKeys] = useState<boolean | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [usage, { keys }, creditsResp] = await Promise.all([getUsage(), listKeys(), getCredits().catch(() => null)]);
        if (cancelled) return;
        setDays(usage.days || []);
        setHasKeys((keys || []).length > 0);
        if (creditsResp) setCredits(creditsResp.balance ?? 0);
      } catch (err: any) {
        if (cancelled) return;
        console.error('Dashboard load failed:', err);
        setError(err?.message || 'Could not load dashboard data.');
        setDays([]);
        setHasKeys(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const email = user?.email || 'developer';
  const name = email.split('@')[0];
  const loading = days === null || hasKeys === null;

  // Last (most recent) day's stats
  const today = days && days.length > 0 ? days[days.length - 1] : null;
  const requestsToday = today?.requests ?? 0;
  const blockedToday = today?.blocked ?? 0;
  const costToday = today?.cost ?? 0;

  // Last 14 days for chart
  const chartDays = days ? days.slice(-14) : [];
  const maxUsage = Math.max(1, ...chartDays.map(d => d.requests));

  return (
    <AppLayout>
      <div className="page-content">
        <div className="term-banner">
          <span className="banner-prompt">$</span> ./dashboard --user={name}
          <span className="banner-status">
            ● {loading ? 'LOADING' : hasKeys ? 'CONNECTED' : 'NO KEYS'}
          </span>
        </div>

        {error && <div className="error-msg retro-error">! {error}</div>}

        {loading ? (
          <div className="loading-row">
            <span className="loading-dots">LOADING<span className="dots-anim">...</span></span>
          </div>
        ) : hasKeys === false ? (
          <div className="dash-empty">
            <span className="dash-empty-icon">◇</span>
            <span className="dash-empty-text">NO API KEYS YET.</span>
            <span className="dash-empty-sub">BUY CREDITS AND WE&apos;LL ISSUE A KEY INSTANTLY. NO SALES CALL.</span>
            <Link to="/pricing" className="btn-terminal">
              <span className="prompt">$</span>
              buy-credits
            </Link>
          </div>
        ) : (
          <>
            <div className="dash-stats-grid">
              <div className="dash-stat-card">
                <div className="dash-stat-value">{num(requestsToday)}</div>
                <div className="dash-stat-label">REQUESTS TODAY</div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-value dash-stat-value--blocked">{num(blockedToday)}</div>
                <div className="dash-stat-label">BLOCKED</div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-value dash-stat-value--cost">{credits !== null ? num(credits) : '—'}</div>
                <div className="dash-stat-label">CREDITS REMAINING</div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-value">${costToday.toFixed(2)}</div>
                <div className="dash-stat-label">SPEND TODAY</div>
              </div>
            </div>

            {credits !== null && credits < 200 && (
              <div className="dash-low-credits">
                <span className="dash-low-warn">! LOW ON CREDITS.</span>
                <span className="dash-low-text">YOU HAVE {num(credits)} LEFT. TOP UP BEFORE YOU HIT ZERO.</span>
                <Link to="/pricing" className="btn-terminal">
                  <span className="prompt">$</span> buy-more
                </Link>
              </div>
            )}

            <div className="dash-section">
              <div className="dash-section-header">
                <span className="dash-section-tag">CHART</span>
                <span className="dash-section-title">REQUESTS (LAST 14 DAYS)</span>
              </div>
              <div className="dash-chart">
                <div className="dash-chart-yaxis">
                  <span>{num(maxUsage)}</span>
                  <span>{num(Math.floor(maxUsage / 2))}</span>
                  <span>0</span>
                </div>
                <div className="dash-chart-bars">
                  {chartDays.map((d, i) => {
                    const heightPct = maxUsage > 0 ? (d.requests / maxUsage) * 100 : 0;
                    const isToday = i === chartDays.length - 1;
                    return (
                      <div key={d.date} className="dash-chart-bar-col">
                        <div
                          className={`dash-chart-bar ${isToday ? 'today' : ''}`}
                          style={{ height: `${heightPct}%` }}
                          title={`${formatDayLabel(d.date)}: ${num(d.requests)} requests, ${num(d.blocked)} blocked`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="dash-chart-labels">
                {chartDays.length > 0 && (
                  <>
                    <span>{formatDayLabel(chartDays[0].date)}</span>
                    <span>{formatDayLabel(chartDays[Math.floor(chartDays.length / 2)].date)}</span>
                    <span>{formatDayLabel(chartDays[chartDays.length - 1].date)}</span>
                  </>
                )}
              </div>
            </div>

            <div className="dash-section">
              <div className="dash-section-header">
                <span className="dash-section-tag">LINKS</span>
                <span className="dash-section-title">QUICK ACTIONS</span>
              </div>
              <div className="dash-links">
                <Link to="/keys" className="dash-link">
                  <span className="dash-link-bracket">[</span>
                  <span className="dash-link-text">MANAGE API KEYS</span>
                  <span className="dash-link-bracket">]</span>
                  <ArrowRightIcon className="dash-link-arrow" />
                </Link>
                <Link to="/docs" className="dash-link">
                  <span className="dash-link-bracket">[</span>
                  <span className="dash-link-text">API DOCS</span>
                  <span className="dash-link-bracket">]</span>
                  <ArrowRightIcon className="dash-link-arrow" />
                </Link>
                <Link to="/pricing" className="dash-link">
                  <span className="dash-link-bracket">[</span>
                  <span className="dash-link-text">BUY MORE CREDITS</span>
                  <span className="dash-link-bracket">]</span>
                  <ArrowRightIcon className="dash-link-arrow" />
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
