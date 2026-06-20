export const Role = {
  ADMIN: 'admin',
  FACULTY: 'faculty',
  STUDENT: 'student',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const AccountStatus = {
  ACTIVE: 'active',
  LOCKED: 'locked',
  DISABLED: 'disabled',
} as const;

export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus];

export const AttendanceStatus = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
} as const;

export type AttendanceStatus = (typeof AttendanceStatus)[keyof typeof AttendanceStatus];

export const SessionStatus = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  LOCKED: 'locked',
} as const;

export type SessionStatus = (typeof SessionStatus)[keyof typeof SessionStatus];

export const StudentStatus = {
  ACTIVE: 'active',
  GRADUATED: 'graduated',
  SUSPENDED: 'suspended',
  DISCONTINUED: 'discontinued',
} as const;

export type StudentStatus = (typeof StudentStatus)[keyof typeof StudentStatus];
