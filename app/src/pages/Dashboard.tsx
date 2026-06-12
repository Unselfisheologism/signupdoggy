import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import { supabase } from '../supabase';
import AppLayout from '../components/AppLayout';

interface Stats {
  total_requests: number;
  blocked_count: number;
  blocked_by_reason: Record<string, number>;
  estimated_cost_usd: number;
  free_tier_remaining: number;
  period: string;
}

function getDayLabels(): string[] {
  const labels: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }
  return labels;
}

const DAY_LABELS = getDayLabels();
const MOCK_USAGE = DAY_LABELS.map((_, i) => {
  const base = i === DAY_LABELS.length - 1 ? 47 : Math.floor(Math.random() * 80 + 20);
  return base;
});

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await supabase.from('api_keys').select('key').limit(1).single();
        if (!data) { setLoading(false); return; }
        const res = await fetch(
          'https://signupdoggy-api.jeffrinjames99.workers.dev/v1/stats',
          { headers: { 'x-api-key': (data as any).key } }
        );
        if (res.ok) {
          const json = await res.json();
          setStats({
            total_requests: json.total_requests || 0,
            blocked_count: json.blocked_count || 0,
            blocked_by_reason: json.blocked_by_reason || {},
            estimated_cost_usd: json.estimated_cost_usd || 0,
            free_tier_remaining: json.free_tier_remaining || 1000,
            period: json.period || new Date().toISOString().split('T')[0],
          });
        }
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchStats();
  }, []);

  const email = user?.email || 'developer';
  const name = email.split('@')[0];
  const remaining = stats?.free_tier_remaining ?? 1000;
  const dailyBudget = 1000;
  const maxUsage = Math.max(...MOCK_USAGE, 1);

  return (
    <AppLayout title="dashboard.signupdoggy.pages.dev">
      <div className="page-content">
        <div className="term-banner">
          <span className="banner-prompt">$</span> ./dashboard --user={name}
          <span className="banner-status">● CONNECTED</span>
        </div>

        {loading && (
          <div className="loading-row">
            <span className="loading-dots">LOADING<span className="dots-anim">...</span></span>
          </div>
        )}

        {error && <div className="error-msg retro-error">{error}</div>}

        {!loading && (
          <>
            <div className="dash-stats-grid">
              <div className="dash-stat-card">
                <div className="dash-stat-value">
                  {stats?.total_requests ?? MOCK_USAGE[MOCK_USAGE.length - 1]}
                </div>
                <div className="dash-stat-label">REQUESTS TODAY</div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-value dash-stat-value--blocked">
                  {stats?.blocked_count ?? 0}
                </div>
                <div className="dash-stat-label">BLOCKED</div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-value dash-stat-value--remaining">
                  {remaining}
                </div>
                <div className="dash-stat-label">FREE TIER REMAINING</div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-value dash-stat-value--cost">
                  ${stats ? stats.estimated_cost_usd.toFixed(2) : '0.00'}
                </div>
                <div className="dash-stat-label">EST. COST TODAY</div>
              </div>
            </div>

            <div className="dash-section">
              <div className="dash-section-header">
                <span className="dash-section-tag">CHART</span>
                <span className="dash-section-title">REQUESTS (14 DAYS)</span>
              </div>
              <div className="dash-chart">
                <div className="dash-chart-yaxis">
                  <span>{maxUsage}</span>
                  <span>{Math.floor(maxUsage / 2)}</span>
                  <span>0</span>
                </div>
                <div className="dash-chart-bars">
                  {MOCK_USAGE.map((val, i) => (
                    <div key={i} className="dash-chart-bar-col">
                      <div
                        className={`dash-chart-bar ${i === MOCK_USAGE.length - 1 ? 'today' : ''}`}
                        style={{ height: `${(val / maxUsage) * 100}%` }}
                        title={`${DAY_LABELS[i]}: ${val} requests`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="dash-chart-labels">
                {[0, Math.floor(DAY_LABELS.length / 2), DAY_LABELS.length - 1].map((idx) => (
                  <span key={idx}>{DAY_LABELS[idx]}</span>
                ))}
              </div>
            </div>

            <div className="dash-section">
              <div className="dash-section-header">
                <span className="dash-section-tag">USAGE</span>
                <span className="dash-section-title">FREE TIER</span>
              </div>
              <div className="dash-progress">
                <div className="dash-progress-info">
                  <span className="dash-progress-label">
                    <span className="dash-progress-pct">
                      {((dailyBudget - remaining) / dailyBudget * 100).toFixed(0)}%
                    </span>
                    {' '}USED TODAY
                  </span>
                  <span className="dash-progress-remaining">
                    {remaining} / {dailyBudget} FREE
                  </span>
                </div>
                <div className="dash-progress-track">
                  <div
                    className={`dash-progress-fill ${remaining > 100 ? 'ok' : 'low'}`}
                    style={{ width: `${((dailyBudget - Math.max(0, remaining)) / dailyBudget) * 100}%` }}
                  />
                </div>
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
                  <span className="dash-link-arrow">→</span>
                </Link>
                <Link to="/docs" className="dash-link">
                  <span className="dash-link-bracket">[</span>
                  <span className="dash-link-text">API DOCS</span>
                  <span className="dash-link-bracket">]</span>
                  <span className="dash-link-arrow">→</span>
                </Link>
                <Link to="/pricing" className="dash-link">
                  <span className="dash-link-bracket">[</span>
                  <span className="dash-link-text">PRICING</span>
                  <span className="dash-link-bracket">]</span>
                  <span className="dash-link-arrow">→</span>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
