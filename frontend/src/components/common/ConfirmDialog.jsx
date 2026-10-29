import Modal from './Modal';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmClass = 'btn-danger', loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className={`btn ${confirmClass}`} onClick={onConfirm} disabled={loading}>
            {loading ? 'Processing...' : confirmText}
          </button>
        </>
      }
    >
      <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
    </Modal>
  );
}
