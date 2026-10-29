import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import ErrorState from '../../components/common/ErrorState';
import { analyticsAPI } from '../../services/api';

function AnalyticsCard({ title, children }) {
  return (
    <div className="analytics-card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function StatRow({ label, value, color }) {
  return (
    <div className="analytics-stat-row">
      <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{label}</span>
      <span className="analytics-stat-value" style={color ? { color } : {}}>{value ?? '—'}</span>
    </div>
  );
}

function renderData(d, colorMap = {}) {
  if (!d) return <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No data</p>;
  if (Array.isArray(d)) {
    if (d.length === 0) return <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No data yet</p>;
    return d.map((item, i) => {
      const label = item.category || item.priority || item.status || item._id || `Item ${i + 1}`;
      const value = item.count ?? item.value ?? item.total;
      return <StatRow key={i} label={label} value={value} color={colorMap[String(label).toLowerCase()]} />;
    });
  }
  return Object.entries(d).filter(([, v]) => typeof v !== 'object').map(([k, v]) => (
    <StatRow key={k} label={k.replace(/_/g, ' ')} value={v} color={colorMap[k.toLowerCase()]} />
  ));
}

export default function Analytics() {
  const [data, setData] = useState({ categories: null, priority: null, status: null, leaderboard: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAll = () => {
    setLoading(true); setError('');
    Promise.all([analyticsAPI.byCategory(), analyticsAPI.byPriority(), analyticsAPI.byStatus(), analyticsAPI.leaderboard()])
      .then(([cat, pri, sta, lb]) => setData({ categories: cat.data, priority: pri.data, status: sta.data, leaderboard: lb.data }))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const statusColors = { pending: 'var(--warning)', assigned: 'var(--info)', completed: '#f97316', verified: 'var(--success)' };
  const priorityColors = { high: 'var(--error)', medium: 'var(--warning)', low: 'var(--text-secondary)' };

  return (
    <DashboardLayout title="Analytics">
      <div className="page-header">
        <h1>Analytics 📊</h1>
        <p>Real-time statistics from your backend</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}><Spinner size="lg" /></div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAll} />
      ) : (
        <div className="analytics-grid">
          <AnalyticsCard title="📊 By Status">{renderData(data.status, statusColors)}</AnalyticsCard>
          <AnalyticsCard title="🎯 By Priority">{renderData(data.priority, priorityColors)}</AnalyticsCard>
          <AnalyticsCard title="🏷️ By Category">{renderData(data.categories)}</AnalyticsCard>
          <AnalyticsCard title="🏆 Volunteer Leaderboard">
            {Array.isArray(data.leaderboard) && data.leaderboard.length > 0 ? (
              data.leaderboard.map((v, i) => (
                <div key={v._id || v.id || i} className="analytics-stat-row">
                  <span style={{ color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>#{i + 1}</strong> {v.name || v.email}
                  </span>
                  <span className="analytics-stat-value">
                    {v.xp ?? v.points ?? 0} XP {v.badge && v.badge !== 'None' ? `· ${v.badge}` : ''}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No leaderboard data yet</p>
            )}
          </AnalyticsCard>
        </div>
      )}
    </DashboardLayout>
  );
}
