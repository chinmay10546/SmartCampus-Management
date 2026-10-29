import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Spinner from '../../components/common/Spinner';
import { ROLES } from '../../utils/constants';
import SmartCampusLogo from '../../components/common/SmartCampusLogo';

/* ── Eye icon ─────────────────────────────────────────────────────────────── */
function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

/* ── Password strength helper ─────────────────────────────────────────────── */
function getStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak',   color: '#ef4444', width: '20%' };
  if (score <= 2) return { score, label: 'Fair',   color: '#f59e0b', width: '45%' };
  if (score <= 3) return { score, label: 'Good',   color: '#3b82f6', width: '70%' };
  return               { score, label: 'Strong', color: '#10b981', width: '100%' };
}

/* ── Role options ─────────────────────────────────────────────────────────── */
const ROLE_OPTIONS = [
  { value: ROLES.STUDENT,   label: 'Student',   desc: 'File & track campus issues' },
  { value: ROLES.VOLUNTEER, label: 'Volunteer', desc: 'Resolve tasks & earn XP' },
];

export default function Register() {
  const { login } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    role: ROLES.STUDENT,
  });
  const [showPw, setShowPw]         = useState(false);
  const [showConfPw, setShowConfPw] = useState(false);
  const [errors, setErrors]         = useState({});
  const [apiError, setApiError]     = useState('');
  const [loading, setLoading]       = useState(false);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((errs) => ({ ...errs, [field]: '' }));
  };

  const strength = getStrength(form.password);

  /* ── Validation ─────────────────────────────────────────────────────────── */
  const validate = useCallback(() => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required.';
    if (!form.email.trim()) e.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (!form.phone.trim()) e.phone = 'Phone number is required.';
    else if (!/^\+?[\d\s\-()]{7,}$/.test(form.phone)) e.phone = 'Enter a valid phone number.';
    if (!form.password) e.password = 'Password is required.';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters.';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    return e;
  }, [form]);

  /* ── Submit ─────────────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      await authAPI.register(payload);
      const user = await login({ email: form.email, password: form.password });
      const map = { student: '/student/dashboard', volunteer: '/volunteer/dashboard', admin: '/admin/dashboard' };
      navigate(map[user.role] || '/');
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* ── Top Navigation Bar ── */}
      <header className="auth-top-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <SmartCampusLogo size={34} variant="mark" />
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.3rem', color: '#FFFFFF', letterSpacing: '-0.01em' }}>
            SmartCampus
          </span>
        </div>

        <nav className="auth-nav-links">
          <a href="/login#home">Home</a>
          <a href="/login#about">About</a>
          <a href="/login#features">Features</a>
          <a href="/login#contact">Contact</a>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            className="theme-toggle"
            onClick={toggle}
            aria-label="Toggle theme"
            style={{
              background: 'rgba(255,255,255,0.12)',
              color: '#FFFFFF',
              borderColor: 'rgba(255,255,255,0.22)',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              borderRadius: '50%',
            }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <Link
            to="/login"
            style={{
              background: '#710014',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.85rem',
              padding: '0.45rem 1.3rem',
              borderRadius: '999px',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(113, 0, 20, 0.45)',
              transition: 'all 0.18s ease',
              display: 'inline-block',
            }}
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* ── Left Hero Section ── */}
      <section className="auth-panel-left">
        <div className="auth-brand">
          <h1 className="auth-brand-headline">
            Join Our<br />
            Campus Community<br />
            <span className="headline-highlight">Together</span>
          </h1>

          <p className="auth-brand-desc">
            Create your account to submit grievances, resolve community tasks, and collaborate transparently across your university.
          </p>

          {/* 4 Feature Cards */}
          <div className="auth-features-row">
            <div className="auth-feature-card">
              <div className="auth-feature-icon-box">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
              </div>
              <div className="auth-feature-label">Quick Reporting</div>
            </div>

            <div className="auth-feature-card">
              <div className="auth-feature-icon-box">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div className="auth-feature-label">Real-time Tracking</div>
            </div>

            <div className="auth-feature-card">
              <div className="auth-feature-icon-box">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className="auth-feature-label">Volunteer Support</div>
            </div>

            <div className="auth-feature-card">
              <div className="auth-feature-icon-box">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="6"/>
                  <line x1="6" y1="12" x2="10" y2="12"/>
                  <line x1="8" y1="10" x2="8" y2="14"/>
                  <line x1="15" y1="13" x2="15.01" y2="13"/>
                  <line x1="18" y1="11" x2="18.01" y2="11"/>
                </svg>
              </div>
              <div className="auth-feature-label">Gamification</div>
            </div>
          </div>

          {/* 3 Stat Badges Row */}
          <div className="auth-stats-row">
            <div className="auth-stat-box">
              <div className="auth-stat-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div>
                <div className="auth-stat-val">3</div>
                <div className="auth-stat-desc">User Roles</div>
              </div>
            </div>

            <div className="auth-stat-box">
              <div className="auth-stat-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <polyline points="9 11 12 14 22 4"/>
                  <line x1="5" y1="18" x2="19" y2="18"/>
                </svg>
              </div>
              <div>
                <div className="auth-stat-val">4</div>
                <div className="auth-stat-desc">Complaint Stages</div>
              </div>
            </div>

            <div className="auth-stat-box">
              <div className="auth-stat-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="7"/>
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                </svg>
              </div>
              <div>
                <div className="auth-stat-val">50</div>
                <div className="auth-stat-desc">XP per Verified Task</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Right Panel: Floating Card ── */}
      <section className="auth-panel-right">
        <div className="auth-card" style={{ maxWidth: '460px' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.15rem' }}>
            <SmartCampusLogo size={46} variant="mark" />
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '1.25rem',
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
                marginTop: '0.45rem',
              }}
            >
              SmartCampus
            </div>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.65rem',
              fontWeight: 700,
              textAlign: 'center',
              color: 'var(--text-primary)',
              marginBottom: '0.2rem',
            }}
          >
            Create Your Account
          </h2>
          <p
            style={{
              textAlign: 'center',
              color: 'var(--text-secondary)',
              fontSize: '0.84rem',
              marginBottom: '1.25rem',
            }}
          >
            Join SmartCampus Management — it's free
          </p>

          {apiError && (
            <div className="auth-error" role="alert" style={{ marginBottom: '1.15rem' }}>
              <span>⚠️</span>
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Role Selector Pills */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                I am registering as a
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginTop: '0.2rem' }}>
                {ROLE_OPTIONS.map((opt) => {
                  const active = form.role === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, role: opt.value }))}
                      style={{
                        padding: '0.65rem 0.75rem',
                        borderRadius: '10px',
                        border: active ? '1.5px solid #710014' : '1px solid var(--border-color)',
                        background: active ? 'rgba(113, 0, 20, 0.08)' : 'var(--bg-secondary)',
                        color: active ? '#710014' : 'var(--text-primary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.18s ease',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{opt.label}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{opt.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name Field */}
            <div className="form-group" style={{ marginBottom: '0.9rem' }}>
              <label htmlFor="reg-name" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Full Name
              </label>
              <input
                id="reg-name"
                type="text"
                placeholder="e.g. Rohan Sharma"
                value={form.name}
                onChange={set('name')}
                autoComplete="name"
                disabled={loading}
              />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            {/* Email and Phone */}
            <div className="form-row" style={{ marginBottom: '0.9rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="reg-email" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Email Address
                </label>
                <input
                  id="reg-email"
                  type="email"
                  placeholder="you@campus.edu"
                  value={form.email}
                  onChange={set('email')}
                  autoComplete="email"
                  disabled={loading}
                />
                {errors.email && <div className="form-error">{errors.email}</div>}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="reg-phone" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Phone Number
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={form.phone}
                  onChange={set('phone')}
                  autoComplete="tel"
                  disabled={loading}
                />
                {errors.phone && <div className="form-error">{errors.phone}</div>}
              </div>
            </div>

            {/* Password */}
            <div className="form-group" style={{ marginBottom: '0.9rem' }}>
              <label htmlFor="reg-password" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Password
              </label>
              <div className="auth-password-wrapper">
                <input
                  id="reg-password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={set('password')}
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="auth-pw-toggle"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  <EyeIcon open={showPw} />
                </button>
              </div>
              {form.password && (
                <div className="auth-strength" style={{ marginTop: '0.35rem' }}>
                  <div className="auth-strength-bar" style={{ height: '4px', background: 'var(--border-color)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: strength.width, background: strength.color, transition: 'all 0.3s ease' }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: strength.color, fontWeight: 600 }}>
                    {strength.label} password
                  </span>
                </div>
              )}
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>

            {/* Confirm Password */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="reg-confirm" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Confirm Password
              </label>
              <div className="auth-password-wrapper">
                <input
                  id="reg-confirm"
                  type={showConfPw ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="auth-pw-toggle"
                  onClick={() => setShowConfPw((v) => !v)}
                  aria-label={showConfPw ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  <EyeIcon open={showConfPw} />
                </button>
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && !errors.confirmPassword && (
                <div className="form-error">Passwords don't match yet</div>
              )}
              {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <><Spinner size="sm" /> Creating account…</>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* OR Divider */}
          <div className="auth-divider">
            <span>OR</span>
          </div>

          {/* Already have an account */}
          <div style={{ textAlign: 'center', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: '#710014',
                fontWeight: 700,
                textDecoration: 'underline',
              }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Bottom Crimson Swoop Wave ── */}
      <div className="auth-swoop-container" aria-hidden="true">
        <svg viewBox="0 0 1440 280" fill="none" preserveAspectRatio="none" className="auth-swoop-svg">
          <path
            d="M0,170 C340,255 640,245 920,180 C1140,125 1300,120 1440,165 L1440,280 L0,280 Z"
            fill="url(#swoopGradReg)"
          />
          <defs>
            <linearGradient id="swoopGradReg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3E000B" stopOpacity="0.96" />
              <stop offset="40%" stopColor="#710014" stopOpacity="0.92" />
              <stop offset="85%" stopColor="#870018" stopOpacity="0.88" />
              <stop offset="100%" stopColor="#4A000D" stopOpacity="0.96" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
