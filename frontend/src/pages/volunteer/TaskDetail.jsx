import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import ErrorState from '../../components/common/ErrorState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { volunteerAPI } from '../../services/api';
import { formatDateTime } from '../../utils/helpers';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/common/Toast';

export default function TaskDetail() {
  const { id } = useParams();
  const { toasts, toast, removeToast } = useToast();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completing, setCompleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchTask = () => {
    setLoading(true);
    volunteerAPI.getTasks()
      .then((res) => {
        const all = Array.isArray(res.data) ? res.data : res.data.tasks || [];
        const found = all.find((t) => (t._id || t.id) === id);
        if (!found) throw new Error('Task not found.');
        setTask(found);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTask(); }, [id]);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await volunteerAPI.completeTask(id);
      toast.success('Task marked as completed!');
      setConfirmOpen(false);
      fetchTask();
    } catch (err) {
      toast.error(err.message || 'Failed to complete task.');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <DashboardLayout title="Task Details">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="page-header">
        <Link to="/volunteer/tasks" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>← Back to My Tasks</Link>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '3rem' }}><Spinner size="lg" /></div>
        : error ? <ErrorState message={error} />
        : (
          <div className="complaint-detail-grid">
            <div>
              <div className="card" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{task.title}</h2>
                  <StatusBadge status={task.status} />
                </div>
                <div className="detail-section">
                  <h3>Description</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{task.description}</p>
                </div>
              </div>

              <div className="card">
                {task.status === 'Assigned' ? (
                  /* ── Volunteer can complete an Assigned task ── */
                  <>
                    <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Complete This Task</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                      Once marked complete, this task will be sent to the admin for verification.
                      XP is awarded only after the admin verifies it.
                    </p>
                    <button
                      className="btn btn-success"
                      onClick={() => setConfirmOpen(true)}
                      disabled={completing}
                      style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                    >
                      {completing ? 'Completing…' : '✅ Complete Task'}
                    </button>
                  </>
                ) : (
                  /* ── Read-only states: Pending / Completed / Verified ── */
                  <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}>
                    {task.status === 'Completed' && (
                      <p style={{ color: 'var(--success)', fontWeight: 600 }}>
                        ✅ Task completed — awaiting admin verification.
                      </p>
                    )}
                    {task.status === 'Verified' && (
                      <p style={{ color: 'var(--success)', fontWeight: 600 }}>
                        🏅 Task verified! XP has been awarded.
                      </p>
                    )}
                    {task.status === 'Pending' && (
                      <p>This task is <strong>Pending</strong> and has not been assigned yet.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="card">
                <div className="detail-section">
                  <h3>Details</h3>
                  <div className="detail-field"><label>Category</label><p>{task.category}</p></div>
                  <div className="detail-field"><label>Priority</label><PriorityBadge priority={task.priority} /></div>
                  <div className="detail-field"><label>Location</label><p>{task.location}</p></div>
                  <div className="detail-field"><label>Status</label><StatusBadge status={task.status} /></div>
                  <div className="detail-field"><label>Filed On</label><p>{formatDateTime(task.created_at)}</p></div>
                  {task.updated_at && <div className="detail-field"><label>Last Updated</label><p>{formatDateTime(task.updated_at)}</p></div>}
                </div>
              </div>
            </div>
          </div>
        )}

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleComplete}
        title="Complete Task?"
        message="Are you sure you've completed this task? It will be sent for admin verification."
        confirmText="Yes, Mark Complete"
        confirmClass="btn-success"
        loading={completing}
      />
    </DashboardLayout>
  );
}
