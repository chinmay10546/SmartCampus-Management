import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { getInitials, formatDate } from '../../utils/helpers';

export default function Profile() {
  const { user } = useAuth();
  return (
    <DashboardLayout title="Profile">
      <div className="page-header"><h1>My Profile</h1></div>
      <div className="card" style={{ maxWidth: '600px' }}>
        <div className="profile-header">
          <div className="profile-avatar">{getInitials(user?.name || user?.email || 'U')}</div>
          <div className="profile-info">
            <h2>{user?.name || '—'}</h2>
            <p>{user?.email}</p>
            <span className="profile-role-badge">{user?.role}</span>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <div className="detail-field"><label>Name</label><p>{user?.name || '—'}</p></div>
          <div className="detail-field"><label>Email</label><p>{user?.email}</p></div>
          <div className="detail-field"><label>Phone</label><p>{user?.phone || '—'}</p></div>
          <div className="detail-field"><label>Role</label><p style={{ textTransform: 'capitalize' }}>{user?.role}</p></div>
          {user?.created_at && <div className="detail-field"><label>Member Since</label><p>{formatDate(user.created_at)}</p></div>}
        </div>
      </div>
    </DashboardLayout>
  );
}
