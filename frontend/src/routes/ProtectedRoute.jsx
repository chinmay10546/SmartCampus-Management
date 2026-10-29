import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';

const roleHome = { student: '/student/dashboard', volunteer: '/volunteer/dashboard', admin: '/admin/dashboard' };

export function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="full-page-center"><Spinner size="lg" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={roleHome[user.role] || '/login'} replace />;
  return children;
}

export function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="full-page-center"><Spinner size="lg" /></div>;
  if (user) return <Navigate to={roleHome[user.role] || '/'} replace />;
  return children;
}
