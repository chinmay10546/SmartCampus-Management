import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';
import { adminAPI } from '../../services/api';

export default function AssignVolunteerModal({ isOpen, onClose, complaint, onSuccess, toast }) {
  const [volunteers, setVolunteers] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [manualId, setManualId] = useState('');
  const [loadingV, setLoadingV] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setSelectedId('');
    setManualId('');
    setFetchError('');
    setLoadingV(true);

    // ── KEY FIX ──────────────────────────────────────────────────────────────
    // Use GET /admin/users/volunteers (reads db.users where role=volunteer).
    // The assign endpoint also looks up volunteers in db.users, so the IDs
    // from this endpoint will match correctly.
    //
    // DO NOT use GET /volunteers — that reads a separate db.volunteers
    // collection whose IDs are completely different from db.users IDs.
    // ─────────────────────────────────────────────────────────────────────────
    adminAPI
      .getVolunteerUsers()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setVolunteers(list);
        if (list.length === 0) {
          setFetchError(
            'No volunteer accounts found. Make sure volunteers have registered with role="volunteer".'
          );
        }
      })
      .catch((err) => {
        setFetchError(
          `Could not load volunteers: ${err.message}. Enter the volunteer's user ID manually below.`
        );
        setVolunteers([]);
      })
      .finally(() => setLoadingV(false));
  }, [isOpen]);

  // The backend's assign endpoint validates: ObjectId(volunteer_id) in db.users
  // So we must pass the user's _id string — which the admin/users/volunteers
  // endpoint returns under the key "id" (already converted from ObjectId).
  const effectiveId = volunteers.length > 0 ? selectedId : manualId.trim();

  const handleAssign = async () => {
    if (!effectiveId) return;

    // Complaint ID: backend converts _id → "id" for admin complaints
    const complaintId = complaint.id || complaint._id;
    if (!complaintId) {
      toast.error('Cannot determine complaint ID. Please refresh and try again.');
      return;
    }

    setAssigning(true);
    try {
      // Backend schema: AssignVolunteer { volunteer_id: str }
      await adminAPI.assignComplaint(complaintId, { volunteer_id: effectiveId });
      toast.success('Volunteer assigned successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      // Show the actual backend error so the admin knows what went wrong
      toast.error(err.message || 'Assignment failed. Check that the volunteer ID is valid.');
    } finally {
      setAssigning(false);
    }
  };

  const canSubmit = volunteers.length > 0 ? !!selectedId : !!manualId.trim();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Volunteer"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={assigning}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleAssign}
            disabled={!canSubmit || assigning}
          >
            {assigning ? 'Assigning…' : 'Assign Volunteer'}
          </button>
        </>
      }
    >
      {/* Complaint being assigned */}
      <div className="form-group">
        <label>Complaint</label>
        <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{complaint?.title}</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
          ID: {complaint?.id || complaint?._id}
        </p>
      </div>

      {/* Volunteer selector */}
      {loadingV ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <Spinner />
          <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Loading volunteers…
          </p>
        </div>
      ) : volunteers.length > 0 ? (
        <div className="form-group">
          <label>Select Volunteer</label>
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            <option value="">-- Select a volunteer --</option>
            {volunteers.map((v) => (
              // v.id is the string version of the user's MongoDB _id
              <option key={v.id} value={v.id}>
                {v.name} — {v.email}
                {v.xp !== undefined ? ` (${v.xp} XP` : ''}
                {v.badge && v.badge !== 'None' ? `, ${v.badge})` : v.xp !== undefined ? ')' : ''}
              </option>
            ))}
          </select>
          {selectedId && (
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontFamily: 'monospace' }}>
              Volunteer ID: {selectedId}
            </p>
          )}
        </div>
      ) : (
        <div>
          {fetchError && (
            <div style={{
              background: 'var(--warning-light)',
              border: '1px solid var(--warning)',
              borderRadius: 'var(--border-radius-sm)',
              padding: '0.65rem 0.875rem',
              marginBottom: '1rem',
              fontSize: '0.8rem',
              color: '#92400e',
            }}>
              {fetchError}
            </div>
          )}
          <div className="form-group">
            <label>Volunteer User ID</label>
            <input
              type="text"
              placeholder="MongoDB user _id of the volunteer"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
            />
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              This must be the <strong>_id</strong> of a user with role "volunteer" from the users collection.
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
