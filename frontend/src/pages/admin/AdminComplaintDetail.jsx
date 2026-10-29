import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import ErrorState from '../../components/common/ErrorState';
import AssignVolunteerModal from '../../components/complaints/AssignVolunteerModal';
import VerifyModal from '../../components/complaints/VerifyModal';
import { adminAPI } from '../../services/api';
import { formatDateTime } from '../../utils/helpers';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/common/Toast';

// Helper — handles { data: [...], total } or plain array
function extractList(d) {
  if (!d) return [];
  if (Array.isArray(d)) return d;
  if (Array.isArray(d.data)) return d.data;
  if (Array.isArray(d.complaints)) return d.complaints;
  if (Array.isArray(d.items)) return d.items;
  return [];
}

export default function AdminComplaintDetail() {
  const { id } = useParams();
  const { toasts, toast, removeToast } = useToast();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignOpen, setAssignOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);

  const fetchComplaint = () => {
    setLoading(true);
    setError('');
    // Fetch all (no filter) so we can find by id
    adminAPI.getComplaints({ limit: 100 })
      .then((res) => {
        const all = extractList(res.data);
        // Backend converts _id → id, so check both
        const found = all.find((c) => c.id === id || c._id === id);
        if (!found) throw new Error('Complaint not found. It may be on a later page — try increasing the limit.');
        setComplaint(found);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  // Backend status values are capitalized
  const status = complaint?.status?.toLowerCase() ?? '';
  const canAssign = status === 'pending' || status === 'assigned';
  const canVerify = status === 'completed';

  return (
    <DashboardLayout title="Complaint Details">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="page-header flex-between">
        <Link to="/admin/complaints" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          ← Back to All Complaints
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <Spinner size="lg" />
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', fontSize: '0.875rem' }}>
            Loading complaint…
          </p>
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchComplaint} />
      ) : (
        <>
          <div className="complaint-detail-grid">
            {/* Left column — main content */}
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
                    <a
                      href={
                        typeof complaint.attachment === 'object'
                          ? complaint.attachment.path
                          : complaint.attachment
                      }
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--primary)' }}
                    >
                      📎 View Attachment
                    </a>
                  </div>
                )}
              </div>

              {/* Admin action buttons */}
              <div className="card">
                <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Admin Actions</h3>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {canAssign && (
                    <button className="btn btn-primary" onClick={() => setAssignOpen(true)}>
                      👤 {status === 'assigned' ? 'Re-assign Volunteer' : 'Assign Volunteer'}
                    </button>
                  )}
                  {canVerify && (
                    <button className="btn btn-success" onClick={() => setVerifyOpen(true)}>
                      ✅ Verify Complaint
                    </button>
                  )}
                  {status === 'verified' && (
                    <span style={{ color: 'var(--success)', fontWeight: 600 }}>✅ Already Verified</span>
                  )}
                  {status === 'pending' && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      Assign a volunteer to start resolving this complaint.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right column — details */}
            <div>
              <div className="card">
                <div className="detail-section">
                  <h3>Details</h3>
                  <div className="detail-field"><label>Complaint ID</label><p style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{complaint.id || complaint._id}</p></div>
                  <div className="detail-field"><label>Category</label><p>{complaint.category}</p></div>
                  <div className="detail-field"><label>Priority</label><PriorityBadge priority={complaint.priority} /></div>
                  <div className="detail-field"><label>Location</label><p>{complaint.location}</p></div>
                  <div className="detail-field"><label>Status</label><StatusBadge status={complaint.status} /></div>
                  <div className="detail-field"><label>Filed On</label><p>{formatDateTime(complaint.created_at)}</p></div>
                  {complaint.updated_at && (
                    <div className="detail-field"><label>Last Updated</label><p>{formatDateTime(complaint.updated_at)}</p></div>
                  )}
                  {complaint.created_by && (
                    <div className="detail-field"><label>Filed By (ID)</label><p style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{complaint.created_by}</p></div>
                  )}
                  {complaint.assigned_to && (
                    <div className="detail-field">
                      <label>Assigned Volunteer (ID)</label>
                      <p style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{complaint.assigned_to}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <AssignVolunteerModal
            isOpen={assignOpen}
            onClose={() => setAssignOpen(false)}
            complaint={complaint}
            onSuccess={fetchComplaint}
            toast={toast}
          />
          <VerifyModal
            isOpen={verifyOpen}
            onClose={() => setVerifyOpen(false)}
            complaint={complaint}
            onSuccess={fetchComplaint}
            toast={toast}
          />
        </>
      )}
    </DashboardLayout>
  );
}
