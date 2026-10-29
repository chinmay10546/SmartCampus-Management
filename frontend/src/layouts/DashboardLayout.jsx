import { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { useNotifications } from '../hooks/useNotifications';

export default function DashboardLayout({ children, title = 'Dashboard' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} unreadCount={unreadCount} />
      <div className="main-content">
        <Header title={title} onMenuToggle={() => setSidebarOpen((p) => !p)} unreadCount={unreadCount} />
        <main className="content-area">{children}</main>
      </div>
    </div>
  );
}
