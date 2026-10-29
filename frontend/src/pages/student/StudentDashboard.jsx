import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import ErrorState from '../../components/common/ErrorState';
import { StatusBadge } from '../../components/common/Badge';
import { studentAPI, complaintsAPI } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

// Category icon helper
function getCategoryIcon(cat = '', title = '') {
  const c = (cat + ' ' + title).toLowerCase();
  if (c.includes('water') || c.includes('plumb') || c.includes('cooler') || c.includes('leak')) {
    return { icon: '💧', bg: '#FDE8E8', color: '#9B1C1C' };
  }
  if (c.includes('light') || c.includes('fan') || c.includes('electr') || c.includes('power')) {
    return { icon: '💡', bg: '#FEF08A', color: '#854D0E' };
  }
  if (c.includes('dustbin') || c.includes('clean') || c.includes('sanitat') || c.includes('waste')) {
    return { icon: '🗑️', bg: '#DCFCE7', color: '#166534' };
  }
  if (c.includes('chair') || c.includes('desk') || c.includes('bench') || c.includes('infrastruct')) {
    return { icon: '🪑', bg: '#FEF3C7', color: '#92400E' };
  }
  if (c.includes('wifi') || c.includes('internet') || c.includes('network') || c.includes('it')) {
    return { icon: '📶', bg: '#E0E7FF', color: '#3730A3' };
  }
  return { icon: '📋', bg: '#F3E8FF', color: '#6B21A8' };
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [dashData, setDashData] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = () => {
    setLoading(true);
    setError('');
    Promise.all([studentAPI.getDashboard(), complaintsAPI.list()])
      .then(([d, c]) => {
        setDashData(d.data);
        const all = Array.isArray(c.data) ? c.data : c.data.complaints || [];
        setRecent(all.slice(0, 5));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const d = dashData || {};
  const stats = {
    total: d.total_complaints ?? d.total ?? recent.length,
    pending: d.pending_complaints ?? d.pending ?? 0,
    assigned: d.assigned_complaints ?? d.assigned ?? 0,
    verified: d.verified_complaints ?? d.verified ?? 0,
  };

  // Resolved percentage for Donut Chart
  const totalCount = stats.total || 1;
  const resolvedCount = stats.verified || 0;
  const resolvedPct = Math.min(100, Math.round((resolvedCount / totalCount) * 100));

  // Donut SVG circumference calculation (r = 45, C = 282.74)
  const radius = 45;
  const circ = 2 * Math.PI * radius;
  const strokeDashoffset = circ - (circ * (resolvedPct || 5)) / 100;

  const firstName = (user?.name || 'Student').split(' ')[0];

  return (
    <DashboardLayout title="">
      {/* ── Greeting Header Row ── */}
      <div className="flex-between mb-2" style={{ alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Good Morning, {firstName}! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            Here's an overview of your complaints and their status.
          </p>
        </div>
        <Link
          to="/student/complaints/new"
          className="btn btn-primary"
          style={{
            borderRadius: '999px',
            padding: '0.65rem 1.35rem',
            boxShadow: '0 4px 14px rgba(113, 0, 20, 0.25)',
          }}
        >
          + New Complaint
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3.5rem' }}><Spinner size="lg" /></div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : (
        <>
          {/* ── 4 Stat Cards ── */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
            {/* Total Complaints */}
            <div className="stat-card stat-card-total">
              <div className="stat-icon">📋</div>
              <div>
                <div className="stat-label">Total Complaints</div>
                <div className="stat-value">{stats.total}</div>
              </div>
            </div>

            {/* Pending */}
            <div className="stat-card stat-card-pending">
              <div className="stat-icon">⏳</div>
              <div>
                <div className="stat-label">Pending</div>
                <div className="stat-value">{stats.pending}</div>
              </div>
            </div>

            {/* In Progress */}
            <div className="stat-card stat-card-progress">
              <div className="stat-icon">🔄</div>
              <div>
                <div className="stat-label">In Progress</div>
                <div className="stat-value">{stats.assigned}</div>
              </div>
            </div>

            {/* Resolved */}
            <div className="stat-card stat-card-resolved">
              <div className="stat-icon">✅</div>
              <div>
                <div className="stat-label">Resolved</div>
                <div className="stat-value">{stats.verified}</div>
              </div>
            </div>
          </div>

          {/* ── Main Two Column Grid ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
            {/* Left: Recent Complaints List */}
            <div className="card" style={{ padding: '1.4rem' }}>
              <div className="flex-between mb-2">
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700 }}>
                  Recent Complaints
                </h2>
                <Link
                  to="/student/complaints"
                  style={{ color: '#710014', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                >
                  View All →
                </Link>
              </div>

              {recent.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                  <p style={{ fontSize: '2.2rem' }}>📭</p>
                  <p style={{ marginTop: '0.5rem', fontWeight: 500 }}>No complaints filed yet.</p>
                  <Link to="/student/complaints/new" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
                    File your first complaint
                  </Link>
                </div>
              ) : (
                <div>
                  {recent.map((c) => {
                    const id = c._id || c.id;
                    const meta = getCategoryIcon(c.category, c.title);
                    return (
                      <Link key={id} to={`/student/complaints/${id}`} className="item-card-row">
                        <div className="item-card-icon" style={{ background: meta.bg, color: meta.color }}>
                          {meta.icon}
                        </div>
                        <div className="item-card-content">
                          <div className="item-card-title">{c.title}</div>
                          <div className="item-card-meta">
                            <span>{c.location || c.category}</span>
                            <span>•</span>
                            <span>{formatDate(c.created_at)}</span>
                          </div>
                        </div>
                        <StatusBadge status={c.status} />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Track Your Impact (Donut Chart) */}
            <div className="card impact-donut-card">
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700 }}>
                  Track Your Impact
                </h2>
                <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>📊</span>
              </div>

              {/* Donut Chart SVG */}
              <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0.75rem 0' }}>
                <svg width="150" height="150" viewBox="0 0 120 120">
                  {/* Background Track */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="#EFE8D0"
                    strokeWidth="12"
                  />
                  {/* Progress Fill */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="#710014"
                    strokeWidth="12"
                    strokeDasharray={circ}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                </svg>

                {/* Center Content */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1.1,
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {resolvedCount}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Resolved
                  </span>
                </div>
              </div>

              {/* Stats Summary below Donut */}
              <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>{stats.total}</strong> Total Filed
                </div>
                <div>•</div>
                <div>
                  <strong style={{ color: '#710014' }}>{resolvedPct}%</strong> Success Rate
                </div>
              </div>

              {/* Bottom Quote Box */}
              <div className="impact-quote-box">
                <span style={{ fontSize: '1.2rem' }}>🌱</span>
                <span>Thank you for making our campus better!</span>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
