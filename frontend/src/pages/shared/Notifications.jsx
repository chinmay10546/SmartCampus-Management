import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { notificationsAPI } from '../../services/api';
import { formatDateTime } from '../../utils/helpers';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/common/Toast';
import { triggerNotifRefresh } from '../../hooks/useNotifications';

// ── Notification type metadata ──────────────────────────────────────────────
const TYPE_META = {
  assignment:   { icon: '📋', label: 'Assignment',   color: 'var(--info)',    bg: 'var(--info-light)' },
  completion:   { icon: '✅', label: 'Completion',   color: 'var(--success)', bg: 'var(--success-light)' },
  verification: { icon: '🏅', label: 'Verified',     color: '#7c3aed',        bg: '#ede9fe' },
  verify:       { icon: '🏅', label: 'Verified',     color: '#7c3aed',        bg: '#ede9fe' },
  xp:           { icon: '⭐', label: 'XP Awarded',   color: '#d97706',        bg: 'var(--warning-light)' },
  badge:        { icon: '🥇', label: 'Badge Update', color: '#d97706',        bg: 'var(--warning-light)' },
  default:      { icon: '🔔', label: 'Notification', color: 'var(--primary)', bg: 'var(--primary-light)' },
};

function getTypeMeta(type) {
  if (!type) return TYPE_META.default;
  const key = type.toLowerCase().replace(/[-\s]/g, '');
  // Fuzzy match
  if (key.includes('assign'))  return TYPE_META.assignment;
  if (key.includes('complet')) return TYPE_META.completion;
  if (key.includes('verif'))   return TYPE_META.verification;
  if (key.includes('xp'))      return TYPE_META.xp;
  if (key.includes('badge'))   return TYPE_META.badge;
  return TYPE_META.default;
}

// ── Safe ID extraction ──────────────────────────────────────────────────────
function getId(n) {
  // Backend converts _id → id for most routers
  // Guard against ObjectId objects by calling toString()
  const raw = n.id ?? n._id;
  return raw ? String(raw) : null;
}

// ── Safe read flag ──────────────────────────────────────────────────────────
function isRead(n) {
  return n.read === true || n.is_read === true;
}

export default function Notifications() {
  const { toasts, toast, removeToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState(null); // which single item is loading
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'

  const fetchNotifications = useCallback(() => {
    setLoading(true);
    setError('');
    notificationsAPI.list()
      .then((res) => {
        const d = res.data;
        // Handle multiple response shapes: array, { notifications: [] }, { data: [] }
        const list = Array.isArray(d)
          ? d
          : Array.isArray(d?.notifications) ? d.notifications
          : Array.isArray(d?.data) ? d.data
          : [];
        // Newest first
        list.sort((a, b) => {
          const ta = new Date(a.created_at || a.timestamp || 0).getTime();
          const tb = new Date(b.created_at || b.timestamp || 0).getTime();
          return tb - ta;
        });
        setNotifications(list);
      })
      .catch((err) => setError(err.message || 'Failed to load notifications.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // ── Mark single read ──────────────────────────────────────────────────────
  const handleMarkRead = async (nId) => {
    setMarkingId(nId);
    try {
      await notificationsAPI.markRead(nId);
      // Optimistic update — match by stringified ID to avoid ObjectId comparison bugs
      setNotifications((prev) =>
        prev.map((n) => getId(n) === nId ? { ...n, read: true, is_read: true } : n)
      );
      // ── FIX: refresh the header badge immediately
      triggerNotifRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to mark as read.');
    } finally {
      setMarkingId(null);
    }
  };

  // ── Mark all read ─────────────────────────────────────────────────────────
  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await notificationsAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true, is_read: true })));
      toast.success('All notifications marked as read.');
      // ── FIX: refresh the header badge immediately
      triggerNotifRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to mark all as read.');
    } finally {
      setMarkingAll(false);
    }
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const displayed = notifications.filter((n) => {
    if (filter === 'unread') return !isRead(n);
    if (filter === 'read')   return isRead(n);
    return true;
  });

  const unreadCount = notifications.filter((n) => !isRead(n)).length;

  return (
    <DashboardLayout title="Notifications">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="page-header flex-between">
        <div>
          <h1>Notifications</h1>
          <p>
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleMarkAllRead}
            disabled={markingAll}
            style={{ whiteSpace: 'nowrap' }}
          >
            {markingAll ? (
              <><span style={{ fontSize: '0.75rem' }}>⏳</span> Marking…</>
            ) : (
              '✓ Mark all read'
            )}
          </button>
        )}
      </div>

      {/* ── Filter tabs ───────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {[
          { key: 'all',    label: `All (${notifications.length})` },
          { key: 'unread', label: `Unread (${unreadCount})` },
          { key: 'read',   label: `Read (${notifications.length - unreadCount})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="btn btn-sm"
            style={{
              background: filter === key ? 'var(--primary)' : 'var(--surface)',
              color: filter === key ? '#fff' : 'var(--text-secondary)',
              border: `1.5px solid ${filter === key ? 'var(--primary)' : 'var(--border-color)'}`,
              fontWeight: filter === key ? 700 : 500,
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <Spinner size="lg" />
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', fontSize: '0.875rem' }}>
            Loading notifications…
          </p>
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchNotifications} />
      ) : displayed.length === 0 ? (
        <EmptyState
          icon="🔔"
          title={filter === 'unread' ? 'No unread notifications' : 'No notifications'}
          message={filter === 'unread' ? 'You have read everything!' : "You're all caught up!"}
        />
      ) : (
        <div
          className="card"
          style={{ padding: 0, overflow: 'hidden' }}
        >
          {displayed.map((n, i) => {
            const read      = isRead(n);
            const nId       = getId(n);
            const meta      = getTypeMeta(n.notification_type || n.type);
            const isMarking = markingId === nId;

            return (
              <div
                key={nId || i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  borderBottom: i < displayed.length - 1 ? '1px solid var(--border-color)' : 'none',
                  background: read ? 'transparent' : 'var(--primary-light)',
                  transition: 'background 0.3s ease',
                  opacity: isMarking ? 0.6 : 1,
                }}
              >
                {/* Type icon */}
                <div
                  style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: meta.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem',
                    border: `1px solid ${meta.color}22`,
                    marginTop: '0.1rem',
                  }}
                >
                  {meta.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                    {/* Unread dot */}
                    {!read && (
                      <span
                        style={{
                          display: 'inline-block', width: 8, height: 8,
                          borderRadius: '50%', background: 'var(--primary)',
                          flexShrink: 0,
                          animation: 'pulse-ring 2s infinite',
                        }}
                      />
                    )}
                    {/* Type label chip */}
                    <span
                      style={{
                        fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.06em', color: meta.color,
                        background: meta.bg, padding: '0.1rem 0.45rem',
                        borderRadius: '999px',
                      }}
                    >
                      {meta.label}
                    </span>
                  </div>

                  {/* Message */}
                  <p
                    style={{
                      fontWeight: read ? 400 : 600,
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      lineHeight: 1.5,
                      wordBreak: 'break-word',
                    }}
                  >
                    {n.message || n.title || n.content || '(No message)'}
                  </p>

                  {/* Timestamp */}
                  {(n.created_at || n.timestamp) && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                      🕐 {formatDateTime(n.created_at || n.timestamp)}
                    </div>
                  )}
                </div>

                {/* Mark read button — only for unread items with a valid ID */}
                {!read && nId && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleMarkRead(nId)}
                    disabled={isMarking || markingAll}
                    style={{ whiteSpace: 'nowrap', flexShrink: 0, alignSelf: 'center' }}
                    aria-label="Mark as read"
                  >
                    {isMarking ? '…' : '✓ Read'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
