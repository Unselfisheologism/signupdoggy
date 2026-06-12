import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getUsage,
  getBilling,
  type UsageDay,
  type BillingMonth,
} from '../api';
import { useAuth } from '../auth';

export default function Dashboard() {
  const { user } = useAuth();
  const [days, setDays] = useState<UsageDay[]>([]);
  const [months, setMonths] = useState<BillingMonth[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [totalBlocked, setTotalBlocked] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getUsage(), getBilling()])
      .then(([u, b]) => {
        setDays(u.days);
        setMonths(b.months);
        setTotalCost(u.days.reduce((s, d) => s + d.cost, 0));
        setTotalBlocked(u.totals.total_blocked);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const today = days.find((d) => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return d.date === todayStr;
  });

  const chartMax = Math.max(...days.map((d) => d.requests), 1);

  if (loading)
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p className="greeting">Welcome back, {user?.user_metadata?.name || user?.email}</p>

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
          <div className="stat-value">
            ${today?.cost.toFixed(2) || '0.00'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">30-Day Cost</div>
          <div className="stat-value">${totalCost.toFixed(2)}</div>
        </div>
      </div>

      <div className="chart-container">
        <h2>Last 30 Days Usage</h2>
        <div className="chart-bars">
          {days.map((d, i) => {
            const isToday = d.date === today?.date;
            return (
              <div
                key={d.date}
                className={'chart-bar' + (isToday ? ' today' : ' other')}
                title={`${d.date}: ${d.requests} requests`}
                style={{
                  height: `${Math.max((d.requests / chartMax) * 100, 2)}%`,
                }}
                onMouseEnter={(e) => {
                  if (!isToday) (e.currentTarget as HTMLElement).style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  if (!isToday) (e.currentTarget as HTMLElement).style.opacity = '';
                }}
              />
            );
          })}
        </div>
        <div className="chart-labels">
          <span>{days[0]?.date || ''}</span>
          <span>{days[days.length - 1]?.date || ''}</span>
        </div>
      </div>

      <div className="table-container">
        <h2>Monthly Billing</h2>
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th style={{ textAlign: 'right' }}>Requests</th>
              <th style={{ textAlign: 'right' }}>Cost</th>
            </tr>
          </thead>
          <tbody>
            {months.map((m) => (
              <tr key={m.month}>
                <td>{m.month}</td>
                <td style={{ textAlign: 'right' }}>
                  {m.requests.toLocaleString()}
                </td>
                <td
                  style={{
                    textAlign: 'right',
                    color: 'var(--accent)',
                    fontWeight: 600,
                  }}
                >
                  ${m.cost.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <Link to="/keys" className="btn btn-primary">
          Manage API Keys →
        </Link>
      </div>
    </div>
  );
}
