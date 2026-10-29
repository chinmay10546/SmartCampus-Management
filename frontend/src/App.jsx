import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute, PublicOnlyRoute } from './routes/ProtectedRoute';
import { useToast } from './hooks/useToast';
import { ToastContainer } from './components/common/Toast';


import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import StudentDashboard from './pages/student/StudentDashboard';
import CreateComplaint from './pages/student/CreateComplaint';
import MyComplaints from './pages/student/MyComplaints';
import StudentComplaintDetail from './pages/student/ComplaintDetail';
import StudentProfile from './pages/student/Profile';

import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';
import MyTasks from './pages/volunteer/MyTasks';
import TaskDetail from './pages/volunteer/TaskDetail';
import VolunteerProfile from './pages/volunteer/Profile';

import AdminDashboard from './pages/admin/AdminDashboard';
import AllComplaints from './pages/admin/AllComplaints';
import AdminComplaintDetail from './pages/admin/AdminComplaintDetail';
import Analytics from './pages/admin/Analytics';
import AdminProfile from './pages/admin/AdminProfile';

import Notifications from './pages/shared/Notifications';
import NotFound from './pages/shared/NotFound';
import Unauthorized from './pages/shared/Unauthorized';

function AppRoutes() {
  const { toasts, toast, removeToast } = useToast();
  return (
    <BrowserRouter>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Student */}
        <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/complaints/new" element={<ProtectedRoute role="student"><CreateComplaint /></ProtectedRoute>} />
        <Route path="/student/complaints/:id" element={<ProtectedRoute role="student"><StudentComplaintDetail /></ProtectedRoute>} />
        <Route path="/student/complaints" element={<ProtectedRoute role="student"><MyComplaints /></ProtectedRoute>} />
        <Route path="/student/notifications" element={<ProtectedRoute role="student"><Notifications /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>} />

        {/* Volunteer */}
        <Route path="/volunteer/dashboard" element={<ProtectedRoute role="volunteer"><VolunteerDashboard /></ProtectedRoute>} />
        <Route path="/volunteer/tasks/:id" element={<ProtectedRoute role="volunteer"><TaskDetail /></ProtectedRoute>} />
        <Route path="/volunteer/tasks" element={<ProtectedRoute role="volunteer"><MyTasks /></ProtectedRoute>} />
        <Route path="/volunteer/notifications" element={<ProtectedRoute role="volunteer"><Notifications /></ProtectedRoute>} />
        <Route path="/volunteer/profile" element={<ProtectedRoute role="volunteer"><VolunteerProfile /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/complaints/:id" element={<ProtectedRoute role="admin"><AdminComplaintDetail /></ProtectedRoute>} />
        <Route path="/admin/complaints" element={<ProtectedRoute role="admin"><AllComplaints /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><Analytics /></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute role="admin"><Notifications /></ProtectedRoute>} />
        <Route path="/admin/profile" element={<ProtectedRoute role="admin"><AdminProfile /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

