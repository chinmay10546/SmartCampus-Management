import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import ErrorState from '../../components/common/ErrorState';
import { complaintsAPI } from '../../services/api';
import { formatDateTime } from '../../utils/helpers';

export default function StudentComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([complaintsAPI.list(), complaintsAPI.history(id)])
      .then(([listRes, histRes]) => {
        const all = Array.isArray(listRes.data) ? listRes.data : listRes.data.complaints || [];
        const found = all.find((c) => (c._id || c.id) === id);
        if (!found) throw new Error('Complaint not found.');
        setComplaint(found);
        setHistory(Array.isArray(histRes.data) ? histRes.data : histRes.data.history || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <DashboardLayout title="Complaint Details">
      <div className="page-header">
        <Link to="/student/complaints" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>← Back to My Complaints</Link>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '3rem' }}><Spinner size="lg" /></div>
        : error ? <ErrorState message={error} />
        : (
          <div className="complaint-detail-grid">
            <div>
              <div className="card" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{complaint.title}</h2>
                  <StatusBadge status={complaint.status} />
                </div>
                <div className="detail-section">
                  <h3>Description</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{complaint.description}</p>
                </div>
                {complaint.attachment && (
                  <div className="detail-field">
                    <label>Attachment</label>
                    <a href={complaint.attachment} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>📎 View Attachment</a>
                  </div>
                )}
              </div>

              {history.length > 0 && (
                <div className="card">
                  <div className="detail-section">
                    <h3>Status History</h3>
                    {history.map((h, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', paddingBottom: '0.75rem', borderBottom: i < history.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', marginTop: 6, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{h.action || h.status || h.event}</div>
                          {h.timestamp && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDateTime(h.timestamp)}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="card">
                <div className="detail-section">
                  <h3>Details</h3>
                  <div className="detail-field"><label>Category</label><p>{complaint.category}</p></div>
                  <div className="detail-field"><label>Priority</label><PriorityBadge priority={complaint.priority} /></div>
                  <div className="detail-field"><label>Location</label><p>{complaint.location}</p></div>
                  <div className="detail-field"><label>Status</label><StatusBadge status={complaint.status} /></div>
                  <div className="detail-field"><label>Filed On</label><p>{formatDateTime(complaint.created_at)}</p></div>
                  {complaint.updated_at && <div className="detail-field"><label>Last Updated</label><p>{formatDateTime(complaint.updated_at)}</p></div>}
                  {complaint.assigned_volunteer && (
                    <div className="detail-field"><label>Assigned Volunteer</label><p>{complaint.assigned_volunteer?.name || complaint.assigned_volunteer}</p></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
    </DashboardLayout>
  );
}
