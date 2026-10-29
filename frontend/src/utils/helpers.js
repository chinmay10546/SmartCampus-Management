import { BADGE_THRESHOLDS } from './constants';

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function getBadgeFromXP(xp = 0) {
  for (let i = BADGE_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= BADGE_THRESHOLDS[i].min) return BADGE_THRESHOLDS[i];
  }
  return BADGE_THRESHOLDS[0];
}

export function getNextBadge(xp = 0) {
  for (let i = 0; i < BADGE_THRESHOLDS.length; i++) {
    if (xp < BADGE_THRESHOLDS[i].min) return BADGE_THRESHOLDS[i];
  }
  return null;
}

export function getInitials(name = '') {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
