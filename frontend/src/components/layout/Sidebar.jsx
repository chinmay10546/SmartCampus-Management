import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import SmartCampusLogo from '../common/SmartCampusLogo';

const navLinks = {
  student: [
    { to: '/student/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/student/complaints', label: 'My Complaints', icon: '📋' },
    { to: '/student/complaints/new', label: 'Create Complaint', icon: '➕' },
    { to: '/student/notifications', label: 'Notifications', icon: '🔔' },
    { to: '/student/profile', label: 'Profile', icon: '👤' },
  ],
  volunteer: [
    { to: '/volunteer/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/volunteer/tasks', label: 'My Tasks', icon: '📋' },
    { to: '/volunteer/dashboard#xp', label: 'XP & Badges', icon: '⭐' },
    { to: '/volunteer/notifications', label: 'Notifications', icon: '🔔' },
    { to: '/volunteer/profile', label: 'Profile', icon: '👤' },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/admin/complaints', label: 'All Complaints', icon: '📋' },
    { to: '/admin/complaints?tab=assign', label: 'Assign Volunteers', icon: '🤝' },
    { to: '/admin/complaints?tab=verify', label: 'Verify Tasks', icon: '✅' },
    { to: '/admin/analytics', label: 'Analytics', icon: '📊' },
    { to: '/admin/notifications', label: 'Notifications', icon: '🔔' },
    { to: '/admin/profile', label: 'Profile', icon: '👤' },
  ],
};

export default function Sidebar({ isOpen, onClose, unreadCount }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = navLinks[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = getInitials(user?.name || user?.email || 'U');

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Top Logo */}
        <div className="sidebar-logo">
          <SmartCampusLogo size={36} />
          <div>
            <div className="sidebar-logo-text">
              <span>Smart</span><span style={{ color: '#E8A0AC' }}>Campus</span>
            </div>
            <div className="sidebar-logo-sub">Campus Management</div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to.endsWith('/dashboard')}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              onClick={onClose}
            >
              <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>{link.icon}</span>
              <span style={{ flex: 1 }}>{link.label}</span>
              {link.label === 'Notifications' && unreadCount > 0 && (
                <span className="badge-dot">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer User Profile Pill Card */}
        <div className="sidebar-footer">
          <div
            className="sidebar-user-card"
            onClick={() => { onClose?.(); navigate(`/${user?.role}/profile`); }}
            title="View Profile"
          >
            <div className="sidebar-avatar" style={{ border: '1.5px solid rgba(255,255,255,0.2)' }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  color: '#fff',
                  fontSize: '0.85rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.name || user?.email || 'User'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#B38F6F', textTransform: 'capitalize' }}>
                {user?.role || 'Member'}
              </div>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem' }}>›</span>
          </div>

          <button
            className="btn btn-sm btn-secondary"
            style={{
              width: '100%',
              marginTop: '0.65rem',
              justifyContent: 'center',
              background: 'transparent',
              color: 'rgba(255,255,255,0.7)',
              borderColor: 'rgba(255,255,255,0.12)',
              borderRadius: '8px',
            }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
