import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Spinner from '../../components/common/Spinner';
import SmartCampusLogo from '../../components/common/SmartCampusLogo';

/* ── Password visibility toggle icon ──────────────────────────────────────── */
function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

export default function Login() {
  const { login } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email.trim()) { setError('Please enter your email address.'); return; }
    if (!form.password) { setError('Please enter your password.'); return; }
    setLoading(true);
    try {
      const user = await login(form);
      const map = { student: '/student/dashboard', volunteer: '/volunteer/dashboard', admin: '/admin/dashboard' };
      navigate(map[user.role] || '/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (id) => (e) => {
    e.preventDefault();
    const elem = document.getElementById(id);
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-page">
      {/* ═══════════════════════════════════════════════════════════════════════════
          1. HERO SECTION (Split View with Floating Sign-in Card)
          ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="auth-hero" id="home">
        {/* ── Top Navigation Bar ── */}
        <header className="auth-top-nav">
          {/* Left Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <SmartCampusLogo size={34} variant="mark" />
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.3rem', color: '#FFFFFF', letterSpacing: '-0.01em' }}>
              SmartCampus
            </span>
          </div>

          {/* Center Nav Links */}
          <nav className="auth-nav-links">
            <a href="#home" onClick={scrollToSection('home')}>Home</a>
            <a href="#about" onClick={scrollToSection('about')}>About</a>
            <a href="#how-it-works" onClick={scrollToSection('how-it-works')}>How It Works</a>
            <a href="#roles" onClick={scrollToSection('roles')}>Roles</a>
            <a href="#gamification" onClick={scrollToSection('gamification')}>Rewards</a>
            <a href="#faq" onClick={scrollToSection('faq')}>FAQ</a>
            <a href="#contact" onClick={scrollToSection('contact')}>Contact</a>
          </nav>

          {/* Right Actions */}
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
            <a
              href="#login-form"
              onClick={scrollToSection('login-form')}
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
            </a>
          </div>
        </header>

        {/* ── Left Hero Section ── */}
        <section className="auth-panel-left">
          <div className="auth-brand">
            {/* Main Hero Headline */}
            <h1 className="auth-brand-headline">
              A Cleaner,<br />
              Smarter Campus<br />
              <span className="headline-highlight">Together</span>
            </h1>

            <p className="auth-brand-desc">
              Report issues, track progress, and make a real difference. SmartCampus connects students, volunteers and admins for a better campus.
            </p>

            {/* 4 Feature Cards (Horizontal Row) */}
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
        <section className="auth-panel-right" id="login-form">
          <div className="auth-card">
            {/* Centered Brand Emblem */}
            <div style={{ textAlign: 'center', marginBottom: '1.15rem' }}>
              <SmartCampusLogo size={48} variant="mark" />
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
              Welcome Back
            </h2>
            <p
              style={{
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: '0.84rem',
                marginBottom: '1.5rem',
              }}
            >
              Sign in to your account
            </p>

            {/* Error Alert */}
            {error && (
              <div className="auth-error" role="alert" style={{ marginBottom: '1.25rem' }}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Email Field */}
              <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                <label htmlFor="login-email" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={set('email')}
                  autoComplete="email"
                  autoFocus
                  disabled={loading}
                />
              </div>

              {/* Password Field */}
              <div className="form-group" style={{ marginBottom: '0.4rem' }}>
                <label htmlFor="login-password" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Password
                </label>
                <div className="auth-password-wrapper">
                  <input
                    id="login-password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={set('password')}
                    autoComplete="current-password"
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
              </div>

              {/* Forgot password link */}
              <div style={{ textAlign: 'right', marginBottom: '1.25rem' }}>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Please contact your campus administrator or IT desk to reset your password.');
                  }}
                  style={{ fontSize: '0.78rem', color: '#710014', fontWeight: 600, textDecoration: 'none' }}
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <><Spinner size="sm" /> Signing in…</>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* OR Divider */}
            <div className="auth-divider">
              <span>OR</span>
            </div>

            {/* New User Register Link */}
            <div style={{ textAlign: 'center', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
              New user?{' '}
              <Link
                to="/register"
                style={{
                  color: '#710014',
                  fontWeight: 700,
                  textDecoration: 'underline',
                }}
              >
                Create an account
              </Link>
            </div>
          </div>
        </section>

        {/* ── Bottom Crimson Swoop Decorative Graphic ── */}
        <div className="auth-swoop-container" aria-hidden="true">
          <svg viewBox="0 0 1440 280" fill="none" preserveAspectRatio="none" className="auth-swoop-svg">
            <path
              d="M0,170 C340,255 640,245 920,180 C1140,125 1300,120 1440,165 L1440,280 L0,280 Z"
              fill="url(#swoopGrad)"
            />
            <defs>
              <linearGradient id="swoopGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3E000B" stopOpacity="0.96" />
                <stop offset="40%" stopColor="#710014" stopOpacity="0.92" />
                <stop offset="85%" stopColor="#870018" stopOpacity="0.88" />
                <stop offset="100%" stopColor="#4A000D" stopOpacity="0.96" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          2. ABOUT SECTION — The Mission & Overview
          ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="landing-section" id="about">
        <div className="landing-header">
          <div className="landing-pill">🏛️ About SmartCampus</div>
          <h2 className="landing-title">Transforming Campus Operations Through Collective Action</h2>
          <p className="landing-subtitle">
            SmartCampus Management is an end-to-end civic operating system that bridges students, student volunteers, and university leadership to keep educational institutions clean, safe, and efficient.
          </p>
        </div>

        <div className="landing-about-grid">
          <div className="landing-about-text">
            <h3>Why Traditional Campus Management Breaks Down</h3>
            <p>
              In most university campuses, everyday infrastructure failures—broken water dispensers, faulty classroom projectors, unhygienic hostel washrooms, and damaged furniture—get lost in forgotten suggestion boxes or chaotic WhatsApp groups.
            </p>
            <p>
              Students feel unheard because they lack visibility into repair progress. Administration struggles to triage incoming problems manually, while passionate students willing to volunteer have no structured system to contribute and gain recognition.
            </p>
            <p>
              <strong>SmartCampus solves this permanently</strong> by creating a real-time, transparent digital ecosystem. Every issue filed follows a verifiable 4-stage pipeline, volunteers earn recognized experience points (XP) for community service, and campus leadership gains complete operational insight.
            </p>

            <div className="landing-about-highlights">
              <div className="landing-highlight-box">
                <div className="num">4x</div>
                <div className="lbl">Faster Resolution with Volunteer Dispatch</div>
              </div>
              <div className="landing-highlight-box">
                <div className="num">100%</div>
                <div className="lbl">Audit Visibility from Report to Verification</div>
              </div>
              <div className="landing-highlight-box">
                <div className="num">+50 XP</div>
                <div className="lbl">Awarded per Verified Volunteer Resolution</div>
              </div>
              <div className="landing-highlight-box">
                <div className="num">Zero</div>
                <div className="lbl">Unanswered or Lost Campus Grievances</div>
              </div>
            </div>
          </div>

          <div>
            <div className="landing-comparison-card">
              <div className="comparison-row">
                <span className="comparison-badge before">⚠️ The Old Campus Reality</span>
                <h4>Unmonitored & Disconnected</h4>
                <p>
                  Paper registers, lost emails, and unofficial chat groups. Issues take weeks to get noticed, volunteers are unmotivated, and campus leaders lack status visibility.
                </p>
              </div>

              <div style={{ height: '1px', background: 'var(--border-color)', margin: '1.5rem 0' }} />

              <div className="comparison-row">
                <span className="comparison-badge after">✨ The SmartCampus Standard</span>
                <h4>Auditable, Gamified & Fast</h4>
                <p>
                  Instant 30-second complaint filing, real-time stage tracking, automated volunteer notifications, single-click administrator verification, and university badges.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          3. LIFECYCLE SECTION — 4-Stage Resolution Pipeline
          ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="landing-section landing-section-alt" id="how-it-works">
        <div className="landing-header">
          <div className="landing-pill">🔄 Resolution Pipeline</div>
          <h2 className="landing-title">How Every Campus Issue Gets Resolved</h2>
          <p className="landing-subtitle">
            A transparent, closed-loop 4-step workflow that ensures total accountability from first discovery to final verification.
          </p>
        </div>

        <div className="lifecycle-grid">
          {/* Step 1 */}
          <div className="lifecycle-card">
            <div className="lifecycle-step-num">1</div>
            <div className="lifecycle-icon">📋</div>
            <h4>Report Filed</h4>
            <p>
              A student spots an issue, selects one of 10 campus categories, sets priority, attaches location and photos, and submits in 30 seconds.
            </p>
            <span className="lifecycle-tag status-pending">🟡 Pending Review</span>
          </div>

          {/* Step 2 */}
          <div className="lifecycle-card">
            <div className="lifecycle-step-num">2</div>
            <div className="lifecycle-icon">📌</div>
            <h4>Volunteer Assigned</h4>
            <p>
              Campus administration reviews the ticket on the command board and dispatches an available student volunteer with real-time in-app alerts.
            </p>
            <span className="lifecycle-tag status-assigned">🔵 Assigned to Volunteer</span>
          </div>

          {/* Step 3 */}
          <div className="lifecycle-card">
            <div className="lifecycle-step-num">3</div>
            <div className="lifecycle-icon">🔧</div>
            <h4>Field Resolution</h4>
            <p>
              The volunteer arrives on site, coordinates necessary fixes or campus support, resolves the issue, and marks the task as completed.
            </p>
            <span className="lifecycle-tag status-completed">🟠 Work Completed</span>
          </div>

          {/* Step 4 */}
          <div className="lifecycle-card">
            <div className="lifecycle-step-num">4</div>
            <div className="lifecycle-icon">🏅</div>
            <h4>Verified & Rewarded</h4>
            <p>
              The administrator inspects the completion. With one click, the complaint is verified as resolved, and the volunteer is rewarded with +50 XP.
            </p>
            <span className="lifecycle-tag status-verified">🟢 Verified (+50 XP)</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          4. ROLES SECTION — Students, Volunteers & Admins
          ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="landing-section" id="roles">
        <div className="landing-header">
          <div className="landing-pill">👥 Three Stakeholder Roles</div>
          <h2 className="landing-title">Tailored Workspaces For Every Campus Role</h2>
          <p className="landing-subtitle">
            SmartCampus gives students, volunteers, and administrators dedicated interfaces designed precisely for their day-to-day workflow.
          </p>
        </div>

        <div className="roles-grid">
          {/* Role 1: Student */}
          <div className="role-card">
            <div className="role-icon-box">🎓</div>
            <h3>For Students</h3>
            <div className="role-tagline">Voice concerns & track progress in real-time</div>
            <p>
              Students are the eyes and ears of the university. SmartCampus gives every student a direct, friction-free channel to report issues.
            </p>
            <ul className="role-features">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>30-second complaint submission with photos & location</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Live progress badge tracking (Pending &rarr; Verified)</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Real-time notifications when your issue is handled</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Personal complaint archive and resolution history</span>
              </li>
            </ul>
          </div>

          {/* Role 2: Volunteer */}
          <div className="role-card">
            <div className="role-icon-box">🤝</div>
            <h3>For Volunteers</h3>
            <div className="role-tagline">Take action, earn XP & university honors</div>
            <p>
              Passionate students gain leadership experience, resolve campus challenges, and receive recognized service credits for their portfolios.
            </p>
            <ul className="role-features">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Dedicated task queue with priority and deadline markers</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>One-tap completion submission upon finishing fieldwork</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Earn +50 XP per verified task to unlock prestige badges</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Tier progression: Bronze &rarr; Silver &rarr; Gold &rarr; Platinum</span>
              </li>
            </ul>
          </div>

          {/* Role 3: Admin */}
          <div className="role-card">
            <div className="role-icon-box">🛡️</div>
            <h3>For Administrators</h3>
            <div className="role-tagline">Total visibility, smart dispatch & verification</div>
            <p>
              Facilities heads, wardens, and staff manage all campus operations from an intuitive, data-rich management center.
            </p>
            <ul className="role-features">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Centralized complaint registry across all campus blocks</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Instant volunteer task assignment with capacity tracking</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>One-click verification protocol that credits volunteer XP</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Campus health analytics, resolution rates & leaderboards</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          5. GAMIFICATION SECTION — Rewards & Badges
          ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="landing-section landing-section-alt" id="gamification">
        <div className="landing-header">
          <div className="landing-pill">🏆 Gamification Engine</div>
          <h2 className="landing-title">Rewarding Civic Service with University Badges</h2>
          <p className="landing-subtitle">
            SmartCampus turns campus maintenance and problem solving into an inspiring social game where student volunteers climb prestige tiers.
          </p>
        </div>

        <div className="tiers-grid">
          {/* Bronze */}
          <div className="tier-card">
            <div className="tier-badge-icon">🥉</div>
            <div className="tier-name">Bronze Badge</div>
            <div className="tier-xp-range">100 – 299 XP</div>
            <p className="tier-desc">
              Unlocked after completing 2 to 5 verified tasks. Demonstrates reliable initial dedication to campus betterment.
            </p>
          </div>

          {/* Silver */}
          <div className="tier-card">
            <div className="tier-badge-icon">🥈</div>
            <div className="tier-name">Silver Badge</div>
            <div className="tier-xp-range">300 – 699 XP</div>
            <p className="tier-desc">
              Unlocked after 6 to 13 verified tasks. Recognized as a trusted, proactive troubleshooter across dorms and departments.
            </p>
          </div>

          {/* Gold */}
          <div className="tier-card">
            <div className="tier-badge-icon">🥇</div>
            <div className="tier-name">Gold Badge</div>
            <div className="tier-xp-range">700 – 1499 XP</div>
            <p className="tier-desc">
              Unlocked after 14 to 29 verified tasks. Senior campus change-maker eligible for university leadership commendations.
            </p>
          </div>

          {/* Platinum */}
          <div className="tier-card">
            <div className="tier-badge-icon">💎</div>
            <div className="tier-name">Platinum Legend</div>
            <div className="tier-xp-range">1500+ XP</div>
            <p className="tier-desc">
              The highest civic honor on campus. Reserved for exceptional volunteers leading long-term campus transformation.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          6. CATEGORIES SECTION — 10 Standardized Categories
          ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="landing-section" id="categories">
        <div className="landing-header">
          <div className="landing-pill">🗂️ Campus Coverage</div>
          <h2 className="landing-title">10 Comprehensive Problem Categories</h2>
          <p className="landing-subtitle">
            SmartCampus standardizes issue reporting to ensure tickets are instantly directed to the appropriate teams.
          </p>
        </div>

        <div className="categories-grid">
          <div className="category-pill">
            <div className="category-icon">🏢</div>
            <div className="category-name">Infrastructure</div>
          </div>
          <div className="category-pill">
            <div className="category-icon">🚰</div>
            <div className="category-name">Sanitation & Water</div>
          </div>
          <div className="category-pill">
            <div className="category-icon">💡</div>
            <div className="category-name">IT & Technology</div>
          </div>
          <div className="category-pill">
            <div className="category-icon">🛡️</div>
            <div className="category-name">Campus Safety</div>
          </div>
          <div className="category-pill">
            <div className="category-icon">📚</div>
            <div className="category-name">Academic Halls</div>
          </div>
          <div className="category-pill">
            <div className="category-icon">🛏️</div>
            <div className="category-name">Hostel & Housing</div>
          </div>
          <div className="category-pill">
            <div className="category-icon">🍲</div>
            <div className="category-name">Canteen & Mess</div>
          </div>
          <div className="category-pill">
            <div className="category-icon">🚌</div>
            <div className="category-name">Transport & Parking</div>
          </div>
          <div className="category-pill">
            <div className="category-icon">⚽</div>
            <div className="category-name">Sports & Grounds</div>
          </div>
          <div className="category-pill">
            <div className="category-icon">📦</div>
            <div className="category-name">General & Other</div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          7. TECHNOLOGY & ARCHITECTURE SECTION
          ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="landing-section landing-section-alt" id="architecture">
        <div className="landing-header">
          <div className="landing-pill">⚡ Architecture</div>
          <h2 className="landing-title">Engineered with Production-Grade Technology</h2>
          <p className="landing-subtitle">
            Built from the ground up for speed, reliability, and security to support institutions of any scale.
          </p>
        </div>

        <div className="tech-grid">
          <div className="tech-card">
            <div className="tech-card-icon">⚡</div>
            <h4>FastAPI Backend</h4>
            <p>
              High-concurrency Python asynchronous framework providing sub-millisecond API response times and automatic OpenAPI validation.
            </p>
          </div>

          <div className="tech-card">
            <div className="tech-card-icon">🍃</div>
            <h4>MongoDB & Motor</h4>
            <p>
              Flexible, non-blocking NoSQL database storing complaints, audit timelines, notification streams, and volunteer XP progression.
            </p>
          </div>

          <div className="tech-card">
            <div className="tech-card-icon">🔐</div>
            <h4>JWT & Role Control</h4>
            <p>
              Strict OAuth2 password bearer tokens and route-level authorization separating Student, Volunteer, and Administrator privileges.
            </p>
          </div>

          <div className="tech-card">
            <div className="tech-card-icon">🎨</div>
            <h4>Adaptive Design System</h4>
            <p>
              Modular React SPA featuring Crimson & Warm Sand palette, Playfair Display typography, and instant Light/Dark mode switching.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          8. FAQ SECTION
          ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="landing-section" id="faq">
        <div className="landing-header">
          <div className="landing-pill">❓ Frequently Asked Questions</div>
          <h2 className="landing-title">Common Questions About SmartCampus</h2>
          <p className="landing-subtitle">
            Everything you need to know about setting up, reporting issues, and volunteering.
          </p>
        </div>

        <div className="faq-grid">
          <div className="faq-card">
            <h4>💡 Who can register on SmartCampus?</h4>
            <p>
              Any student, volunteer, or faculty staff member with an official campus email can create an account in seconds. Registration requires only your name, email, phone number, and selected role.
            </p>
          </div>

          <div className="faq-card">
            <h4>🏅 How do volunteers earn XP and badges?</h4>
            <p>
              Volunteers receive tasks assigned by campus administrators. When field work is done, the volunteer marks it completed. Once verified by administration, +50 XP is automatically credited to unlock Bronze, Silver, Gold, or Platinum badges.
            </p>
          </div>

          <div className="faq-card">
            <h4>⏱️ How fast do complaints typically get resolved?</h4>
            <p>
              Because administrators can instantly dispatch nearby student volunteers rather than waiting for external vendors, high-priority issues are typically acknowledged and assigned within hours.
            </p>
          </div>

          <div className="faq-card">
            <h4>📱 Is SmartCampus accessible on mobile devices?</h4>
            <p>
              Yes! The application is fully responsive and optimized for mobile smartphones, tablets, and desktop workstations, allowing students and volunteers to report and update tasks on the go.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          9. CALL TO ACTION BANNER
          ═══════════════════════════════════════════════════════════════════════════ */}
      <div style={{ padding: '0 2rem' }}>
        <div className="landing-cta-banner">
          <h2>Ready to Build a Better Campus Experience?</h2>
          <p>
            Join hundreds of students, proactive volunteers, and administrators working together for a cleaner, safer, and smarter university.
          </p>
          <div className="landing-cta-actions">
            <a href="#login-form" onClick={scrollToSection('login-form')} className="btn-cta-light">
              <span>Sign In to Your Account</span>
              <span>&rarr;</span>
            </a>
            <Link to="/register" className="btn-cta-outline">
              Create Free Account
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          10. FOOTER
          ═══════════════════════════════════════════════════════════════════════════ */}
      <footer className="landing-footer" id="contact">
        <div className="landing-footer-inner">
          <div className="landing-footer-grid">
            {/* Brand Column */}
            <div className="landing-footer-brand">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <SmartCampusLogo size={36} variant="mark" />
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                  SmartCampus
                </span>
              </div>
              <p>
                The premier campus grievance redressing and volunteer empowerment platform. Connecting universities for rapid civic resolution.
              </p>
              <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.65rem' }}>
                <span style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem', background: 'var(--surface-2)', border: '1px solid var(--border-color)', borderRadius: '999px', fontWeight: 600 }}>
                  🏛️ University Edition
                </span>
                <span style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem', background: 'var(--surface-2)', border: '1px solid var(--border-color)', borderRadius: '999px', fontWeight: 600 }}>
                  🔒 JWT Secured
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="landing-footer-col">
              <h5>Navigation</h5>
              <ul>
                <li><a href="#home" onClick={scrollToSection('home')}>Home</a></li>
                <li><a href="#about" onClick={scrollToSection('about')}>About Platform</a></li>
                <li><a href="#how-it-works" onClick={scrollToSection('how-it-works')}>4-Stage Pipeline</a></li>
                <li><a href="#roles" onClick={scrollToSection('roles')}>Campus Roles</a></li>
                <li><a href="#gamification" onClick={scrollToSection('gamification')}>Rewards & Badges</a></li>
              </ul>
            </div>

            {/* Portals */}
            <div className="landing-footer-col">
              <h5>Portals</h5>
              <ul>
                <li><a href="#login-form" onClick={scrollToSection('login-form')}>Student Portal</a></li>
                <li><a href="#login-form" onClick={scrollToSection('login-form')}>Volunteer Hub</a></li>
                <li><a href="#login-form" onClick={scrollToSection('login-form')}>Admin Console</a></li>
                <li><Link to="/register">Create Account</Link></li>
              </ul>
            </div>

            {/* Contact & Support */}
            <div className="landing-footer-col">
              <h5>Campus Support</h5>
              <ul>
                <li><span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>📍 Campus Administration Block</span></li>
                <li><span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>✉️ helpdesk@smartcampus.edu</span></li>
                <li><span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>📞 +91 (080) 4567-8900</span></li>
                <li><span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>⏱️ Mon–Fri: 9:00 AM – 6:00 PM</span></li>
              </ul>
            </div>
          </div>

          <div className="landing-footer-bottom">
            <div>
              &copy; {new Date().getFullYear()} SmartCampus Management System. All rights reserved.
            </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="#home" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</a>
              <a href="#home" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Terms of Service</a>
              <a href="#home" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Campus Guidelines</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
