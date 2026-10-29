import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Unauthorized() {
  const { user } = useAuth();
  const home = user ? `/${user.role}/dashboard` : '/login';
  return (
    <div className="full-page-center" style={{ flexDirection: 'column', gap: '1rem' }}>
      <div style={{ fontSize: '5rem' }}>🚫</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>403 — Access Denied</h1>
      <p style={{ color: 'var(--text-secondary)' }}>You don't have permission to view this page.</p>
      <Link to={home} className="btn btn-primary">Go to Dashboard</Link>
    </div>
  );
}
