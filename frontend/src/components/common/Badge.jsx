import { STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS } from '../../utils/constants';
import { getBadgeFromXP } from '../../utils/helpers';

export function StatusBadge({ status }) {
  if (!status) return null;
  const key = status.toLowerCase();
  return (
    <span className={`badge ${STATUS_COLORS[key] || ''}`}>
      {STATUS_LABELS[key] || status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  if (!priority) return null;
  const key = priority.toLowerCase();
  return <span className={`badge ${PRIORITY_COLORS[key] || ''}`}>{priority}</span>;
}

export function BadgeDisplay({ xp = 0 }) {
  const badge = getBadgeFromXP(xp);
  const emojis = { None: '—', Bronze: '🥉', Silver: '🥈', Gold: '🥇', Platinum: '💎' };
  return (
    <span className="badge" style={{ background: badge.color + '22', color: badge.color, fontWeight: 700 }}>
      {emojis[badge.name] || ''} {badge.name}
    </span>
  );
}
