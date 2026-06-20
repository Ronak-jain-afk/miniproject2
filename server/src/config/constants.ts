export const ROLES = {
  ADMIN: 'admin',
  FACULTY: 'faculty',
  STUDENT: 'student',
} as const;

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
} as const;

export const SESSION_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  LOCKED: 'locked',
} as const;

export const STUDENT_STATUS = {
  ACTIVE: 'active',
  GRADUATED: 'graduated',
  SUSPENDED: 'suspended',
  DISCONTINUED: 'discontinued',
} as const;

export const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  LOCKED: 'locked',
  DISABLED: 'disabled',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;
