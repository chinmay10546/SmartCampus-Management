import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { adminAPI } from '../../services/api';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/helpers';
import { CATEGORIES, PRIORITY_LEVELS } from '../../utils/constants';

const PAGE_LIMIT = 10;

// ─── Helper: extract complaints array from ANY backend response shape ─────────
function extractList(d) {
  if (!d) return { list: [], count: 0 };
  if (Array.isArray(d)) return { list: d, count: d.length };
  // Backend returns: { page, limit, total, data: [...] }  ← actual shape
  if (Array.isArray(d.data)) return { list: d.data, count: d.total ?? d.data.length };
  if (Array.isArray(d.complaints)) return { list: d.complaints, count: d.total ?? d.complaints.length };
  if (Array.isArray(d.items)) return { list: d.items, count: d.total ?? d.items.length };
  return { list: [], count: 0 };
}

export default function AllComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  // Backend uses capitalized statuses: Pending / Assigned / Completed / Verified
  const [filter, setFilter] = useState({ status: '', priority: '', category: '' });
  const [page, setPage] = useState(1);
  const searchTimeout = useRef(null);

  const fetchFiltered = useCallback((params) => {
    setLoading(true);
    setError('');
    setIsSearchMode(false);
    adminAPI
      .getComplaints(params)
      .then((res) => {
        const { list, count } = extractList(res.data);
        setComplaints(list);
        setTotal(count);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load complaints.');
        setComplaints([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, []);

  const fetchSearch = useCallback((q) => {
    setLoading(true);
    setError('');
    setIsSearchMode(true);
    adminAPI
      .searchComplaints(q)
      .then((res) => {
        const { list } = extractList(res.data);
        setComplaints(list);
        setTotal(list.length);
      })
      .catch((err) => {
        setError(err.message || 'Search failed.');
        setComplaints([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!searchQuery) fetchFiltered({ ...filter, page, limit: PAGE_LIMIT });
  }, [filter, page, fetchFiltered, searchQuery]);

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    setPage(1);
    clearTimeout(searchTimeout.current);
    if (!q.trim()) fetchFiltered({ ...filter, page: 1, limit: PAGE_LIMIT });
    else searchTimeout.current = setTimeout(() => fetchSearch(q), 400);
  };

  const setF = (k, v) => { setFilter((p) => ({ ...p, [k]: v })); setPage(1); setSearchQuery(''); };
  const clearFilters = () => { setFilter({ status: '', priority: '', category: '' }); setSearchQuery(''); setPage(1); };
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  return (
    <DashboardLayout title="All Complaints">
      <div className="page-header flex-between">
        <div>
          <h1>All Complaints</h1>
          <p>
            {isSearchMode
              ? `${total} result${total !== 1 ? 's' : ''} for "${searchQuery}"`
              : `${total} total`}
          </p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="filters-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search complaints..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        {/* Status — values must match backend's capitalized strings */}
        <select
          className="filter-select"
          value={filter.status}
          onChange={(e) => setF('status', e.target.value)}
          disabled={!!searchQuery}
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Assigned">Assigned</option>
          <option value="Completed">Completed</option>
          <option value="Verified">Verified</option>
        </select>

        <select
          className="filter-select"
          value={filter.priority}
          onChange={(e) => setF('priority', e.target.value)}
          disabled={!!searchQuery}
        >
          <option value="">All Priorities</option>
          {PRIORITY_LEVELS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filter.category}
          onChange={(e) => setF('category', e.target.value)}
          disabled={!!searchQuery}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {(filter.status || filter.priority || filter.category || searchQuery) && (
          <button className="btn btn-secondary btn-sm" onClick={clearFilters}>
            Clear
          </button>
        )}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <Spinner size="lg" />
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', fontSize: '0.875rem' }}>
            Loading complaints from server…
          </p>
        </div>
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={() => fetchFiltered({ ...filter, page, limit: PAGE_LIMIT })}
        />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No complaints found"
          message={
            filter.status || filter.priority || filter.category || searchQuery
              ? 'Try adjusting your search or filters.'
              : 'No complaints have been submitted yet.'
          }
        />
      ) : (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Filed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id || c._id}>
                    <td>
                      <Link
                        to={`/admin/complaints/${c.id || c._id}`}
                        style={{ color: 'var(--primary)', fontWeight: 500 }}
                      >
                        {c.title}
                      </Link>
                    </td>
                    <td>{c.category}</td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{c.location}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {formatDate(c.created_at)}
                    </td>
                    <td>
                      <Link
                        to={`/admin/complaints/${c.id || c._id}`}
                        className="btn btn-secondary btn-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!isSearchMode && totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
              >
                ‹ Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`pagination-btn ${p === page ? 'active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="pagination-btn"
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
              >
                Next ›
              </button>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
