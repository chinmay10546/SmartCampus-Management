import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getInitials } from '../../utils/helpers';

export default function Header({ title, onMenuToggle, unreadCount }) {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const notifPath = `/${user?.role}/notifications`;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (user?.role === 'admin') {
      navigate(`/admin/complaints?q=${encodeURIComponent(searchQuery)}`);
    } else if (user?.role === 'student') {
      navigate(`/student/complaints?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate(`/volunteer/tasks?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="hamburger-btn btn" onClick={onMenuToggle} aria-label="Toggle menu">☰</button>
        {title && <span className="header-title">{title}</span>}
      </div>

      {/* Center Search Bar */}
      <form onSubmit={handleSearchSubmit} className="header-search">
        <span className="header-search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search complaints, tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search"
        />
      </form>

      <div className="header-right">
        {/* Theme toggle */}
        <button
          className="theme-toggle"
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Notifications */}
        <button
          className="header-icon-btn"
          onClick={() => navigate(notifPath)}
          aria-label="Notifications"
        >
          🔔
          {unreadCount > 0 && (
            <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>

        {/* Avatar */}
        <div
          className="header-avatar"
          title={user?.name || user?.email}
          onClick={() => navigate(`/${user?.role}/profile`)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate(`/${user?.role}/profile`)}
        >
          {getInitials(user?.name || user?.email || 'U')}
        </div>
      </div>
    </header>
  );
}
