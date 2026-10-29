export const ROLES = {
  STUDENT: 'student',
  VOLUNTEER: 'volunteer',
  ADMIN: 'admin',
};

export const COMPLAINT_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  COMPLETED: 'completed',
  VERIFIED: 'verified',
};

export const STATUS_LABELS = {
  pending: 'Pending',
  assigned: 'Assigned',
  completed: 'Completed',
  verified: 'Verified',
};

export const STATUS_COLORS = {
  pending: 'status-pending',
  assigned: 'status-assigned',
  completed: 'status-completed',
  verified: 'status-verified',
};

// Exact backend enum values
export const CATEGORIES = ['Hostel', 'Classroom', 'Electricity', 'Water', 'Cleaning', 'Other'];

// Exact backend enum values (capitalized)
export const PRIORITY_LEVELS = ['Low', 'Medium', 'High'];

export const PRIORITY_COLORS = {
  low: 'priority-low',
  medium: 'priority-medium',
  high: 'priority-high',
};

export const BADGE_THRESHOLDS = [
  { min: 0, max: 99, name: 'None', color: '#6b7280' },
  { min: 100, max: 299, name: 'Bronze', color: '#cd7f32' },
  { min: 300, max: 699, name: 'Silver', color: '#9ca3af' },
  { min: 700, max: 1499, name: 'Gold', color: '#f59e0b' },
  { min: 1500, max: Infinity, name: 'Platinum', color: '#818cf8' },
];
