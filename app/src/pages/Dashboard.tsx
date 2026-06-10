import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUsage, getBilling, type UsageDay, type BillingMonth } from '../api';
import { useAuth } from '../auth';

export default function Dashboard() {
  const { user } = useAuth();
  const [days, setDays] = useState<UsageDay[]>([]);
  const [months, setMonths] = useState<BillingMonth[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [totalBlocked, setTotalBlocked] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getUsage(), getBilling()]).then(([u, b]) => {
      setDays(u.days);
      setMonths(b.months);
      setTotalCost(u.days.reduce((s, d) => s + d.cost, 0));
      setTotalBlocked(u.totals.total_blocked);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const today = days.find(d => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return d.date === todayStr;
  });

  const chartMax = Math.max(...days.map(d => d.requests), 1);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p style={{ color: 'var(--text2)', marginBottom: '1.5rem' }}>Welcome back, {user?.name}</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Today's Requests</div>
          <div className="stat-value">{today?.requests || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Blocked Today</div>
          <div className="stat-value">{today?.blocked || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Est. Cost Today</div>
          <div className="stat-value">${today?.cost.toFixed(2) || '0.00'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">30-Day Cost</div>
          <div className="stat-value">${totalCost.toFixed(2)}</div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Last 30 Days Usage</h2>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '120px', position: 'relative' }}>
          {days.map((d, i) => (
            <div
              key={d.date}
              title={`${d.date}: ${d.requests} requests`}
              style={{
                flex: 1,
                height: `${Math.max((d.requests / chartMax) * 100, 1)}%`,
                background: d.date === today?.date ? 'var(--accent)' : 'var(--accent)',
                opacity: d.date === today?.date ? 1 : 0.5,
                borderRadius: '2px 2px 0 0',
                transition: 'opacity 0.15s',
                cursor: 'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => {
                if (d.date !== today?.date) e.currentTarget.style.opacity = '0.5';
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text3)', marginTop: '0.35rem' }}>
          <span>{days[0]?.date || ''}</span>
          <span>{days[days.length - 1]?.date || ''}</span>
        </div>
      </div>

      <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Monthly Billing</h2>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg3)' }}>
              <th style={{ padding: '0.6rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem' }}>Month</th>
              <th style={{ padding: '0.6rem 1rem', textAlign: 'right', fontWeight: 600, fontSize: '0.85rem' }}>Requests</th>
              <th style={{ padding: '0.6rem 1rem', textAlign: 'right', fontWeight: 600, fontSize: '0.85rem' }}>Cost</th>
            </tr>
          </thead>
          <tbody>
            {months.map(m => (
              <tr key={m.month} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '0.6rem 1rem', color: 'var(--text2)' }}>{m.month}</td>
                <td style={{ padding: '0.6rem 1rem', textAlign: 'right', color: 'var(--text2)' }}>{m.requests.toLocaleString()}</td>
                <td style={{ padding: '0.6rem 1rem', textAlign: 'right', color: 'var(--accent)', fontWeight: 600 }}>${m.cost.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <Link to="/keys" className="btn">Manage API Keys →</Link>
      </div>
    </div>
  );
}
