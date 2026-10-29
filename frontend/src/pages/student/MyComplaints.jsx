import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { complaintsAPI } from '../../services/api';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/helpers';
import { CATEGORIES, PRIORITY_LEVELS } from '../../utils/constants';

const PAGE_SIZE = 10;

export default function MyComplaints() {
  const location = useLocation();
  const successMsg = location.state?.success;
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ status: '', priority: '', category: '' });
  const [page, setPage] = useState(1);

  const fetchComplaints = () => {
    setLoading(true);
    complaintsAPI.list()
      .then((res) => setComplaints(Array.isArray(res.data) ? res.data : res.data.complaints || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchComplaints(); }, []);

  const filtered = complaints.filter((c) => {
    if (filter.status && c.status !== filter.status) return false;
    if (filter.priority && c.priority !== filter.priority) return false;
    if (filter.category && c.category !== filter.category) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <DashboardLayout title="My Complaints">
      <div className="page-header flex-between">
        <div><h1>My Complaints</h1><p>{complaints.length} total</p></div>
        <Link to="/student/complaints/new" className="btn btn-primary">➕ New</Link>
      </div>

      {successMsg && (
        <div style={{ background: 'var(--success-light)', border: '1px solid var(--success)', borderRadius: 'var(--border-radius-sm)', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#065f46', fontSize: '0.875rem' }}>
          ✅ {successMsg}
        </div>
      )}

      <div className="filters-bar">
        <select className="filter-select" value={filter.status} onChange={(e) => { setFilter({ ...filter, status: e.target.value }); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="completed">Completed</option>
          <option value="verified">Verified</option>
        </select>
        <select className="filter-select" value={filter.priority} onChange={(e) => { setFilter({ ...filter, priority: e.target.value }); setPage(1); }}>
          <option value="">All Priorities</option>
          {PRIORITY_LEVELS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="filter-select" value={filter.category} onChange={(e) => { setFilter({ ...filter, category: e.target.value }); setPage(1); }}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {(filter.status || filter.priority || filter.category) && (
          <button className="btn btn-secondary btn-sm" onClick={() => setFilter({ status: '', priority: '', category: '' })}>Clear</button>
        )}
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '3rem' }}><Spinner size="lg" /></div>
        : error ? <ErrorState message={error} onRetry={fetchComplaints} />
        : paged.length === 0 ? <EmptyState icon="📭" title="No complaints found" message="Try adjusting your filters." />
        : (
          <>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Title</th><th>Category</th><th>Priority</th><th>Location</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {paged.map((c) => (
                    <tr key={c._id || c.id}>
                      <td><Link to={`/student/complaints/${c._id || c.id}`} style={{ color: 'var(--primary)', fontWeight: 500 }}>{c.title}</Link></td>
                      <td>{c.category}</td>
                      <td><PriorityBadge priority={c.priority} /></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{c.location}</td>
                      <td><StatusBadge status={c.status} /></td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{formatDate(c.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="pagination">
                <button className="pagination-btn" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>‹ Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} className={`pagination-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="pagination-btn" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>Next ›</button>
              </div>
            )}
          </>
        )}
    </DashboardLayout>
  );
}
