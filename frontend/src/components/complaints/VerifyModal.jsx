import { useState } from 'react';
import Modal from '../common/Modal';
import { adminAPI } from '../../services/api';

export default function VerifyModal({ isOpen, onClose, complaint, onSuccess, toast }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.verifyComplaint(complaint._id || complaint.id);
      setResult(res.data);
      onSuccess();
    } catch (err) {
      toast.error(err.message || 'Verification failed.');
      onClose();
    } finally { setLoading(false); }
  };

  if (result) {
    return (
      <Modal isOpen={isOpen} onClose={() => { setResult(null); onClose(); }} title="✅ Complaint Verified!"
        footer={<button className="btn btn-primary" onClick={() => { setResult(null); onClose(); }}>Done</button>}
      >
        <div style={{ textAlign: 'center', padding: '0.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Complaint verified successfully!</p>
          {result.xp !== undefined && <p style={{ color: 'var(--success)', fontWeight: 700, fontSize: '1.1rem' }}>+{result.xp} XP awarded</p>}
          {result.badge && result.badge !== 'None' && <p style={{ color: 'var(--warning)', fontWeight: 700, marginTop: '0.5rem' }}>🏅 Badge: {result.badge}</p>}
          {result.volunteer && <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Volunteer: {result.volunteer}</p>}
          {result.message && <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{result.message}</p>}
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Verify Complaint"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-success" onClick={handleVerify} disabled={loading}>
            {loading ? 'Verifying...' : '✅ Verify Complaint'}
          </button>
        </>
      }
    >
      <p style={{ color: 'var(--text-secondary)' }}>
        Verify <strong style={{ color: 'var(--text-primary)' }}>{complaint?.title}</strong>?
      </p>
      <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
        This will award <strong>50 XP</strong> to the assigned volunteer.
      </p>
    </Modal>
  );
}
