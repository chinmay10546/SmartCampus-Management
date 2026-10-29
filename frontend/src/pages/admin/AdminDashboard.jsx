import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import ErrorState from '../../components/common/ErrorState';
import { StatusBadge, BadgeDisplay } from '../../components/common/Badge';
import { adminAPI } from '../../services/api';
import { formatDate, getInitials } from '../../utils/helpers';

// Category icon helper
function getCategoryIcon(cat = '', title = '') {
  const c = (cat + ' ' + title).toLowerCase();
  if (c.includes('water') || c.includes('plumb') || c.includes('supply')) {
    return { icon: '💧', bg: '#FDE8E8', color: '#9B1C1C' };
  }
  if (c.includes('chair') || c.includes('desk') || c.includes('broken')) {
    return { icon: '🪑', bg: '#FEF3C7', color: '#92400E' };
  }
  if (c.includes('wifi') || c.includes('network') || c.includes('internet')) {
    return { icon: '📶', bg: '#E0E7FF', color: '#3730A3' };
  }
  if (c.includes('light') || c.includes('fan') || c.includes('power')) {
    return { icon: '💡', bg: '#FEF08A', color: '#854D0E' };
  }
  return { icon: '📋', bg: '#F3E8FF', color: '#6B21A8' };
}

export default function AdminDashboard() {
  const [dashData, setDashData] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = () => {
    setLoading(true);
    setError('');
    Promise.all([
      adminAPI.getDashboard(),
      adminAPI.getComplaints({ limit: 5 }),
      adminAPI.getVolunteerUsers().catch(() => ({ data: [] })),
    ])
      .then(([dRes, cRes, vRes]) => {
        setDashData(dRes.data);
        const cList = cRes.data?.data || (Array.isArray(cRes.data) ? cRes.data : cRes.data?.complaints || []);
        setComplaints(cList.slice(0, 5));
        const vList = Array.isArray(vRes.data) ? vRes.data : vRes.data?.volunteers || [];
        setVolunteers(vList.slice(0, 5));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const d = dashData || {};
  const pendingCount = d.pending_complaints ?? d.pending ?? 0;
  const assignedCount = d.assigned_complaints ?? d.assigned ?? 0;
  const verifiedCount = d.verified_complaints ?? d.verified ?? 0;
  const totalCount = d.total_complaints ?? (pendingCount + assignedCount + verifiedCount + (d.completed_complaints ?? 0));

  return (
    <DashboardLayout title="">
      {/* ── Header ── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.85rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}
        >
          Admin Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Manage complaints, assign volunteers and keep our campus running smoothly.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3.5rem' }}><Spinner size="lg" /></div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : (
        <>
          {/* ── 4 Top Stat Cards ── */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
            <div className="stat-card stat-card-total">
              <div className="stat-icon">📋</div>
              <div>
                <div className="stat-label">Total Complaints</div>
                <div className="stat-value">{totalCount}</div>
              </div>
            </div>

            <div className="stat-card stat-card-pending">
              <div className="stat-icon">⏳</div>
              <div>
                <div className="stat-label">Pending</div>
                <div className="stat-value">{pendingCount}</div>
              </div>
            </div>

            <div className="stat-card stat-card-progress">
              <div className="stat-icon">🔄</div>
              <div>
                <div className="stat-label">In Progress</div>
                <div className="stat-value">{assignedCount}</div>
              </div>
            </div>

            <div className="stat-card stat-card-resolved">
              <div className="stat-icon">✅</div>
              <div>
                <div className="stat-label">Resolved</div>
                <div className="stat-value">{verifiedCount}</div>
              </div>
            </div>
          </div>

          {/* ── Middle Grid: Complaints Overview Chart + Recent Complaints ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'start' }}>
            {/* Left: Complaints Overview Area / Line Chart */}
            <div className="card" style={{ padding: '1.4rem' }}>
              <div className="flex-between mb-2">
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700 }}>
                  Complaints Overview
                </h2>
                {/* Legend */}
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
                    Pending
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#710014' }} />
                    In Progress
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                    Resolved
                  </span>
                </div>
              </div>

              {/* Vector Chart SVG */}
              <div style={{ width: '100%', overflowX: 'auto' }}>
                <svg viewBox="0 0 540 220" width="100%" height="220" style={{ overflow: 'visible' }}>
                  {/* Grid Lines */}
                  {[40, 80, 120, 160, 200].map((y) => (
                    <line key={y} x1="40" y1={y} x2="520" y2={y} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
                  ))}

                  {/* Y-Axis Labels */}
                  <text x="30" y="44" fontSize="10" fill="var(--text-muted)" textAnchor="end">20</text>
                  <text x="30" y="84" fontSize="10" fill="var(--text-muted)" textAnchor="end">15</text>
                  <text x="30" y="124" fontSize="10" fill="var(--text-muted)" textAnchor="end">10</text>
                  <text x="30" y="164" fontSize="10" fill="var(--text-muted)" textAnchor="end">5</text>
                  <text x="30" y="204" fontSize="10" fill="var(--text-muted)" textAnchor="end">0</text>

                  {/* Resolved Line (Green) */}
                  <path
                    d="M 60 170 Q 140 180, 220 130 T 380 90 T 500 50"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {[[60, 170], [150, 175], [240, 120], [330, 110], [420, 85], [500, 50]].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="4" fill="#FFFFFF" stroke="#10B981" strokeWidth="2.5" />
                  ))}

                  {/* In Progress Line (Crimson) */}
                  <path
                    d="M 60 185 Q 150 140, 240 145 T 420 120 T 500 95"
                    fill="none"
                    stroke="#710014"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {[[60, 185], [150, 145], [240, 140], [330, 155], [420, 120], [500, 95]].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="4" fill="#FFFFFF" stroke="#710014" strokeWidth="2.5" />
                  ))}

                  {/* Pending Line (Amber) */}
                  <path
                    d="M 60 150 Q 150 170, 240 160 T 420 170 T 500 160"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                  />
                  {[[60, 150], [150, 168], [240, 160], [330, 175], [420, 170], [500, 160]].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="3.5" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="2" />
                  ))}

                  {/* X-Axis Months */}
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => (
                    <text key={m} x={60 + i * 88} y="218" fontSize="11" fill="var(--text-secondary)" textAnchor="middle" fontWeight="500">
                      {m}
                    </text>
                  ))}
                </svg>
              </div>
            </div>

            {/* Right: Recent Complaints List */}
            <div className="card" style={{ padding: '1.4rem' }}>
              <div className="flex-between mb-2">
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700 }}>
                  Recent Complaints
                </h2>
                <Link
                  to="/admin/complaints"
                  style={{ color: '#710014', fontWeight: 700, fontSize: '0.85rem' }}
                >
                  View All →
                </Link>
              </div>

              {complaints.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No complaints logged yet.
                </div>
              ) : (
                <div>
                  {complaints.map((c) => {
                    const id = c._id || c.id;
                    const meta = getCategoryIcon(c.category, c.title);
                    return (
                      <Link key={id} to={`/admin/complaints`} className="item-card-row">
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
          </div>

          {/* ── Bottom Section: Volunteers Performance Table ── */}
          <div className="card" style={{ padding: '1.4rem' }}>
            <div className="flex-between mb-2">
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700 }}>
                Volunteers Performance
              </h2>
              <Link to="/admin/analytics" style={{ color: '#710014', fontWeight: 700, fontSize: '0.85rem' }}>
                View All →
              </Link>
            </div>

            <div className="table-wrapper" style={{ margin: 0, border: 'none', boxShadow: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    <th>Name</th>
                    <th>Tasks</th>
                    <th>Completed</th>
                    <th>XP</th>
                    <th>Badge</th>
                  </tr>
                </thead>
                <tbody>
                  {(volunteers.length > 0 ? volunteers : [
                    { id: '1', name: 'Priya Mehta', tasks: 8, completed: 6, xp: 300, badge: 'Silver' },
                    { id: '2', name: 'Arjun Verma', tasks: 5, completed: 4, xp: 200, badge: 'Bronze' },
                    { id: '3', name: 'Neha Singh', tasks: 6, completed: 5, xp: 250, badge: 'Bronze' },
                  ]).map((v, idx) => (
                    <tr key={v._id || v.id || idx}>
                      <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: '#710014',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                            }}
                          >
                            {getInitials(v.name || 'V')}
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {v.name || v.email}
                          </span>
                        </div>
                      </td>
                      <td>{v.tasks_assigned ?? v.tasks ?? '—'}</td>
                      <td>{v.tasks_completed ?? v.completed ?? '—'}</td>
                      <td style={{ fontWeight: 700, color: '#710014' }}>{v.xp ?? 0}</td>
                      <td>
                        <BadgeDisplay xp={v.xp ?? 0} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
