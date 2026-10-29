import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { complaintsAPI } from '../../services/api';
import { CATEGORIES } from '../../utils/constants';
import Spinner from '../../components/common/Spinner';

const PRIORITY_OPTIONS = [
  { value: 'Low', label: 'Low', dot: '#10B981', color: '#047857' },
  { value: 'Medium', label: 'Medium', dot: '#F59E0B', color: '#B45309' },
  { value: 'High', label: 'High', dot: '#EF4444', color: '#B91C1C' },
];

export default function CreateComplaint() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'Medium',
    location: '',
  });
  const [attachment, setAttachment] = useState(null);
  const [fileName, setFileName] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required.';
    if (!form.description.trim()) e.description = 'Description is required.';
    if (!form.category) e.category = 'Please select a category.';
    if (!form.location.trim()) e.location = 'Location is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await complaintsAPI.create({ ...form, attachment });
      navigate('/student/complaints', { state: { success: 'Complaint submitted successfully!' } });
    } catch (err) {
      setApiError(err.message || 'Failed to submit complaint.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
      setFileName(file.name);
    }
  };

  return (
    <DashboardLayout title="">
      {/* ── Back Navigation Link ── */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link
          to="/student/complaints"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-secondary)',
            fontSize: '0.88rem',
            fontWeight: 600,
          }}
        >
          ← Back
        </Link>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        {/* ── Header ── */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.85rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            Create a New Complaint
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Help us keep the campus clean and safe.
          </p>
        </div>

        {/* ── Form Card ── */}
        <div className="card" style={{ padding: '2rem' }}>
          {apiError && (
            <div
              style={{
                background: 'var(--error-light)',
                border: '1px solid var(--error)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                color: 'var(--error)',
                fontSize: '0.875rem',
              }}
            >
              ⚠️ {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                placeholder="e.g. Water cooler not working"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              {errors.title && <div className="form-error">{errors.title}</div>}
            </div>

            {/* Category */}
            <div className="form-group">
              <label>Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && <div className="form-error">{errors.category}</div>}
            </div>

            {/* Priority Selector Pills */}
            <div className="form-group">
              <label>Priority *</label>
              <div className="priority-pills">
                {PRIORITY_OPTIONS.map((opt) => {
                  const isActive = form.priority.toLowerCase() === opt.value.toLowerCase();
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className={`priority-pill ${isActive ? 'active' : ''}`}
                      onClick={() => setForm({ ...form, priority: opt.value })}
                    >
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: isActive ? '#FFFFFF' : opt.dot,
                        }}
                      />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location */}
            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                placeholder="e.g. Block A, 2nd Floor"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
              {errors.location && <div className="form-error">{errors.location}</div>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label>Description *</label>
              <textarea
                rows={4}
                placeholder="Describe the issue in detail..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              {errors.description && <div className="form-error">{errors.description}</div>}
            </div>

            {/* Add Photo / Dropzone */}
            <div className="form-group">
              <label>Add Photo (Optional)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <div
                className="upload-dropzone"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="upload-icon">📤</div>
                {fileName ? (
                  <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.88rem' }}>
                    📎 {fileName}
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Click to upload or drag and drop
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      PNG, JPG up to 5MB
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
              style={{
                marginTop: '1.25rem',
                justifyContent: 'center',
                borderRadius: '10px',
                height: '48px',
                boxShadow: '0 4px 14px rgba(113, 0, 20, 0.25)',
              }}
            >
              {loading ? (
                <><Spinner size="sm" /> Submitting Complaint...</>
              ) : (
                'Submit Complaint'
              )}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
