import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import ErrorState from '../../components/common/ErrorState';
import { BadgeDisplay } from '../../components/common/Badge';
import { volunteerAPI } from '../../services/api';
import { getBadgeFromXP, getNextBadge, formatDate } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = () => {
    setLoading(true);
    setError('');
    Promise.all([volunteerAPI.getDashboard(), volunteerAPI.getTasks()])
      .then(([d, t]) => {
        setDashboard(d.data);
        setTasks(Array.isArray(t.data) ? t.data : t.data.tasks || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleComplete = async (taskId) => {
    setCompletingId(taskId);
    setSuccessMsg('');
    try {
      await volunteerAPI.completeTask(taskId);
      setSuccessMsg('Task marked as completed! Admin will verify and award 50 XP.');
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to complete task.');
    } finally {
      setCompletingId(null);
    }
  };

  const xp = dashboard?.xp ?? dashboard?.total_xp ?? user?.xp ?? 0;
  const badge = getBadgeFromXP(xp);
  const nextBadge = getNextBadge(xp);
  const progress = nextBadge ? Math.min(100, Math.max(5, ((xp - badge.min) / (nextBadge.min - badge.min)) * 100)) : 100;
  const xpRemaining = nextBadge ? nextBadge.min - xp : 0;

  const assignedTasks = tasks.filter((t) => (t.status || '').toLowerCase() === 'assigned');
  const completedCount = dashboard?.completed_count ?? tasks.filter((t) => (t.status || '').toLowerCase() === 'completed').length;
  const firstName = (user?.name || 'Volunteer').split(' ')[0];

  return (
    <DashboardLayout title="">
      {/* ── Greeting Header ── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.85rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}
        >
          Good Morning, {firstName}! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Ready to make a difference today?
        </p>
      </div>

      {successMsg && (
        <div
          style={{
            background: 'var(--success-light)',
            border: '1px solid var(--success)',
            color: '#065F46',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            fontSize: '0.88rem',
            fontWeight: 500,
          }}
        >
          ✅ {successMsg}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3.5rem' }}><Spinner size="lg" /></div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : (
        <>
          {/* ── 4 Top Stat Cards ── */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
            {/* My Tasks */}
            <div className="stat-card stat-card-total">
              <div className="stat-icon">📋</div>
              <div>
                <div className="stat-label">My Tasks</div>
                <div className="stat-value">{assignedTasks.length}</div>
              </div>
            </div>

            {/* Completed */}
            <div className="stat-card stat-card-resolved">
              <div className="stat-icon">✅</div>
              <div>
                <div className="stat-label">Completed</div>
                <div className="stat-value">{completedCount}</div>
              </div>
            </div>

            {/* Total XP */}
            <div className="stat-card stat-card-pending">
              <div className="stat-icon">⭐</div>
              <div>
                <div className="stat-label">Total XP</div>
                <div className="stat-value">{xp}</div>
              </div>
            </div>

            {/* Current Badge */}
            <div className="stat-card stat-card-progress">
              <div className="stat-icon">🥈</div>
              <div>
                <div className="stat-label">Current Badge</div>
                <div className="stat-value" style={{ fontSize: '1.35rem' }}>{badge.name}</div>
              </div>
            </div>
          </div>

          {/* ── Main Two Column Grid ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
            {/* Left: Assigned Tasks */}
            <div className="card" style={{ padding: '1.4rem' }}>
              <div className="flex-between mb-2">
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700 }}>
                  Assigned Tasks
                </h2>
                <Link to="/volunteer/tasks" style={{ color: '#710014', fontWeight: 700, fontSize: '0.85rem' }}>
                  View All →
                </Link>
              </div>

              {assignedTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                  <p style={{ fontSize: '2.2rem' }}>🎉</p>
                  <p style={{ marginTop: '0.4rem', fontWeight: 500 }}>All tasks completed! Great work.</p>
                </div>
              ) : (
                <div>
                  {assignedTasks.map((t) => {
                    const id = t._id || t.id;
                    const isCompleting = completingId === id;
                    return (
                      <div
                        key={id}
                        className="item-card-row"
                        style={{ justifyContent: 'space-between' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0 }}>
                          <div className="item-card-icon" style={{ background: '#FFF7ED', color: '#C26000' }}>
                            🛠️
                          </div>
                          <div className="item-card-content">
                            <div className="item-card-title">{t.title}</div>
                            <div className="item-card-meta">
                              <span>{t.location || 'Campus'}</span>
                              <span>•</span>
                              <span style={{ color: t.priority?.toLowerCase() === 'high' ? '#C62828' : 'inherit' }}>
                                {t.priority || 'Medium'} Priority
                              </span>
                              <span>•</span>
                              <span style={{ color: '#B38F6F' }}>
                                🕒 {formatDate(t.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Complete Task Button */}
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={isCompleting}
                          onClick={() => handleComplete(id)}
                          style={{
                            borderRadius: '999px',
                            padding: '0.45rem 1rem',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            boxShadow: '0 2px 8px rgba(113, 0, 20, 0.2)',
                          }}
                        >
                          {isCompleting ? 'Completing...' : 'Complete Task'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Your Progress & Recent Achievements */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Your Progress */}
              <div className="card" style={{ padding: '1.35rem' }}>
                <div className="flex-between mb-2">
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700 }}>
                    Your Progress
                  </h2>
                  <span style={{ fontSize: '1.2rem' }}>🏅</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {xp} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ {nextBadge ? nextBadge.min : xp} XP</span>
                  </span>
                  <BadgeDisplay xp={xp} />
                </div>

                {/* Progress bar */}
                <div style={{ height: '9px', background: '#EFE8D0', borderRadius: '999px', overflow: 'hidden', margin: '0.5rem 0' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${progress}%`,
                      background: 'linear-gradient(90deg, #710014, #B38F6F)',
                      borderRadius: '999px',
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                  {nextBadge ? (
                    <span><strong>{xpRemaining} XP</strong> to {nextBadge.name} Badge</span>
                  ) : (
                    <span style={{ color: 'var(--success)' }}>🎉 Maximum Rank Reached!</span>
                  )}
                </div>
              </div>

              {/* Recent Achievements */}
              <div className="card" style={{ padding: '1.35rem' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
                  Recent Achievements
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#D8F3DC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                      ✅
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Task Completed
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        +50 XP awarded upon verification
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                      🥈
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {badge.name} Badge Earned
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Recognized campus contributor
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
