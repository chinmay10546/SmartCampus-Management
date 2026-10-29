import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function NotFound() {
  const { user } = useAuth();
  const home = user ? `/${user.role}/dashboard` : '/login';
  return (
    <div className="full-page-center" style={{ flexDirection: 'column', gap: '1rem' }}>
      <div style={{ fontSize: '5rem' }}>🔍</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>404 — Page Not Found</h1>
      <p style={{ color: 'var(--text-secondary)' }}>The page you're looking for doesn't exist.</p>
      <Link to={home} className="btn btn-primary">Go Home</Link>
    </div>
  );
}
