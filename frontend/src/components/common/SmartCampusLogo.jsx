/**
 * SmartCampusLogo — Official Brand Identity
 * 
 * Embodies the collegiate "S" ribbon merged with campus architecture
 * and graduation cap (mortarboard), based on the SmartCampus brand identity.
 * 
 * Supports 3 variants:
 *  - 'mark'       : Emblem icon only (default, scales to any square size)
 *  - 'horizontal' : Emblem on left + "SmartCampus" wordmark on right
 *  - 'vertical'   : Emblem on top + "SmartCampus" wordmark centered below
 */
export default function SmartCampusLogo({
  size = 36,
  variant = 'mark',
  className = '',
  style = {},
}) {
  // Gradient IDs unique to component instance
  const capId = 'sc_cap_grad';
  const ribbonId = 'sc_ribbon_grad';
  const sandId = 'sc_sand_grad';
  const darkId = 'sc_dark_grad';

  /* ──────────────────────────────────────────────────────────────────────────
     EMBLEM GRAPHIC (viewBox: 0 0 200 200)
     ────────────────────────────────────────────────────────────────────────── */
  const renderEmblem = () => (
    <g>
      {/* ── Flanking Side Wings (Architectural Neoclassical Columns) ── */}
      {/* Left Wing */}
      {/* Outer column body */}
      <path d="M 28 148 L 42 139 L 42 178 L 28 178 Z" fill={`url(#${sandId})`} />
      {/* Outer crimson trim / pylon */}
      <path d="M 28 148 L 33 145 L 33 178 L 28 178 Z" fill={`url(#${darkId})`} />
      {/* Inner taller column body */}
      <path d="M 45 137 L 59 128 L 59 178 L 45 178 Z" fill={`url(#${sandId})`} />

      {/* Right Wing (Symmetrical) */}
      {/* Inner taller column body */}
      <path d="M 141 128 L 155 137 L 155 178 L 141 178 Z" fill={`url(#${sandId})`} />
      {/* Outer column body */}
      <path d="M 158 139 L 172 148 L 172 178 L 158 178 Z" fill={`url(#${sandId})`} />
      {/* Outer crimson trim / pylon */}
      <path d="M 167 145 L 172 148 L 172 178 L 167 178 Z" fill={`url(#${darkId})`} />

      {/* ── Central Building Base & Portal ── */}
      {/* Left main tower wall */}
      <path d="M 62 122 L 78 112 L 78 178 L 62 178 Z" fill={`url(#${darkId})`} />
      
      {/* Center facade behind doorway */}
      <path d="M 78 114 L 122 142 L 122 178 L 78 178 Z" fill="currentColor" opacity="0.06" />

      {/* Warm Sand Arched Portal / Entrance */}
      <path
        d="M 86 178 L 86 142 C 86 128, 114 128, 114 142 L 114 178 Z"
        fill={`url(#${sandId})`}
      />
      {/* Inner portal shadow depth */}
      <path
        d="M 89 178 L 89 144 C 89 133, 111 133, 111 144 L 111 178 Z"
        fill="#5A000E"
        opacity="0.16"
      />

      {/* ── The "S" Ribbon & Campus Tower Structure ── */}
      {/* Main continuous ribbon forming the monumental S */}
      <path
        d="
          M 138 78
          C 138 66, 120 56, 100 56
          C 78 56, 64 66, 64 81
          C 64 95, 75 103, 94 113
          L 120 126
          C 140 136, 151 148, 151 163
          L 151 178
          L 130 178
          L 130 163
          C 130 154, 122 148, 108 141
          L 84 128
          C 63 117, 44 104, 44 79
          C 44 52, 70 36, 100 36
          C 126 36, 140 49, 143 60
          Z
        "
        fill={`url(#${ribbonId})`}
      />

      {/* Ribbon Highlights & Contour Grooves */}
      {/* Clean contour groove along the under-diagonal curve */}
      <path
        d="M 78 112 L 119 133 C 130 139, 136 146, 136 156 L 136 178"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      {/* Archway crisp outline */}
      <path
        d="M 83.5 178 L 83.5 142 C 83.5 125, 116.5 125, 116.5 142 L 116.5 178"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        opacity="0.9"
      />

      {/* ── Graduation Cap / Mortarboard at Apex ── */}
      {/* Mortarboard Diamond Board */}
      <polygon points="100,10 168,36 100,56 32,36" fill={`url(#${capId})`} />
      {/* 3D Under-bevel of Mortarboard */}
      <polygon points="32,36 32,40 100,60 168,40 168,36 100,56" fill="#42000A" />
      {/* Cap crown under board */}
      <polygon points="80,54 120,54 125,66 75,66" fill="#300006" opacity="0.85" />

      {/* ── Tassel (Draped over right side) ── */}
      {/* Tassel cord */}
      <path
        d="M 158 39 Q 161 54 161 70"
        stroke="#42000A"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      {/* Tassel golden neck band */}
      <rect x="159" y="70" width="4.5" height="2.5" rx="0.8" fill={`url(#${sandId})`} />
      {/* Tassel drop / fob */}
      <rect x="158" y="72.5" width="6.5" height="15" rx="2.5" fill={`url(#${capId})`} />
    </g>
  );

  /* Shared Definitions (Gradients) */
  const renderDefs = () => (
    <defs>
      <linearGradient id={capId} x1="100" y1="10" x2="100" y2="60" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#9E0B25" />
        <stop offset="45%" stopColor="#7E0017" />
        <stop offset="100%" stopColor="#54000F" />
      </linearGradient>

      <linearGradient id={ribbonId} x1="70" y1="50" x2="150" y2="180" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#91001A" />
        <stop offset="35%" stopColor="#710014" />
        <stop offset="100%" stopColor="#4A000D" />
      </linearGradient>

      <linearGradient id={sandId} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#C9AC8E" />
        <stop offset="50%" stopColor="#B38F6F" />
        <stop offset="100%" stopColor="#9C7756" />
      </linearGradient>

      <linearGradient id={darkId} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#630011" />
        <stop offset="100%" stopColor="#380009" />
      </linearGradient>
    </defs>
  );

  /* ──────────────────────────────────────────────────────────────────────────
     VARIANT RENDERING
     ────────────────────────────────────────────────────────────────────────── */

  // 1. Mark only (Icon)
  if (variant === 'mark') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 200"
        width={size}
        height={size}
        className={className}
        style={{ overflow: 'visible', ...style }}
        aria-label="SmartCampus Management logo mark"
        role="img"
        fill="none"
      >
        {renderDefs()}
        {renderEmblem()}
      </svg>
    );
  }

  // 2. Horizontal: Emblem on Left + Wordmark on Right
  if (variant === 'horizontal') {
    return (
      <div
        className={`sc-logo-horizontal ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: Math.max(10, size * 0.28),
          textDecoration: 'none',
          ...style,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 200"
          width={size}
          height={size}
          style={{ flexShrink: 0, overflow: 'visible' }}
          fill="none"
          role="img"
        >
          {renderDefs()}
          {renderEmblem()}
        </svg>

        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span
            style={{
              fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: size * 0.62,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              display: 'flex',
              alignItems: 'baseline',
            }}
          >
            <span style={{ color: 'var(--text-primary, #161616)' }}>Smart</span>
            <span style={{ color: '#710014' }}>Campus</span>
          </span>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: size * 0.24,
              color: 'var(--text-secondary, #5a5651)',
              letterSpacing: '0.04em',
              marginTop: size * 0.08,
              fontWeight: 500,
            }}
          >
            Campus Management
          </span>
        </div>
      </div>
    );
  }

  // 3. Vertical / Full: Emblem on top + Wordmark centered below
  return (
    <div
      className={`sc-logo-vertical ${className}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: size * 0.14,
        ...style,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 200"
        width={size}
        height={size}
        style={{ overflow: 'visible' }}
        fill="none"
        role="img"
      >
        {renderDefs()}
        {renderEmblem()}
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.1 }}>
        <span
          style={{
            fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: size * 0.32,
            fontWeight: 800,
            letterSpacing: '-0.03em',
          }}
        >
          <span style={{ color: 'var(--text-primary, #161616)' }}>Smart</span>
          <span style={{ color: '#710014' }}>Campus</span>
        </span>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: size * 0.14,
            color: 'var(--text-secondary, #5a5651)',
            letterSpacing: '0.05em',
            marginTop: size * 0.04,
            fontWeight: 500,
          }}
        >
          Management Platform
        </span>
      </div>
    </div>
  );
}
