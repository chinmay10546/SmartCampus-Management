import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { volunteerAPI } from '../../services/api';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/helpers';

const PAGE_SIZE = 10;

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchTasks = () => {
    setLoading(true);
    volunteerAPI.getTasks()
      .then((res) => setTasks(Array.isArray(res.data) ? res.data : res.data.tasks || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTasks(); }, []);

  const filtered = filter ? tasks.filter((t) => t.status === filter) : tasks;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <DashboardLayout title="My Tasks">
      <div className="page-header flex-between">
        <div><h1>My Tasks</h1><p>{tasks.length} total task{tasks.length !== 1 ? 's' : ''}</p></div>
      </div>

      <div className="filters-bar">
        {['', 'assigned', 'completed', 'verified'].map((s) => (
          <button key={s} className={`btn ${filter === s ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => { setFilter(s); setPage(1); }}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '3rem' }}><Spinner size="lg" /></div>
        : error ? <ErrorState message={error} onRetry={fetchTasks} />
        : paged.length === 0 ? <EmptyState icon="🎯" title="No tasks found" message="No tasks match the selected filter." />
        : (
          <>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Title</th><th>Category</th><th>Priority</th><th>Location</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
                <tbody>
                  {paged.map((t) => (
                    <tr key={t._id || t.id}>
                      <td><Link to={`/volunteer/tasks/${t._id || t.id}`} style={{ color: 'var(--primary)', fontWeight: 500 }}>{t.title}</Link></td>
                      <td>{t.category}</td>
                      <td><PriorityBadge priority={t.priority} /></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{t.location}</td>
                      <td><StatusBadge status={t.status} /></td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{formatDate(t.created_at)}</td>
                      <td><Link to={`/volunteer/tasks/${t._id || t.id}`} className="btn btn-secondary btn-sm">Details</Link></td>
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
