import { UserRole } from '../models/enums';

/** Map legacy roles stored in MongoDB to current role enum */
export function normalizeUserRole(role: string): UserRole {
  switch (role) {
    case UserRole.CITIZEN:
    case 'USER':
      return UserRole.CITIZEN;
    case UserRole.DEPARTMENT:
    case 'OFFICER':
      return UserRole.DEPARTMENT;
    case UserRole.HEAD_OF_DEPARTMENTS:
    case 'HEAD':
    case 'AUTHORITY':
      return UserRole.HEAD_OF_DEPARTMENTS;
    case UserRole.ADMIN:
      return UserRole.ADMIN;
    default:
      return UserRole.CITIZEN;
  }
}

export function isLegacyRole(role: string): boolean {
  return role === 'USER' || role === 'HEAD' || role === 'CITIZEN' || role === 'AUTHORITY' || role === 'OFFICER';
}
