import { UserRole } from '../models/enums';

export function getRoleDashboardPath(role: UserRole): string {
  switch (role) {
    case UserRole.CITIZEN:
      return '/user/dashboard';
    case UserRole.DEPARTMENT:
      return '/department/dashboard';
    case UserRole.HEAD_OF_DEPARTMENTS:
      return '/head/dashboard';
    case UserRole.ADMIN:
      return '/admin/dashboard';
    default:
      return '/login';
  }
}

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.CITIZEN]: 'Citizen',
  [UserRole.DEPARTMENT]: 'Department',
  [UserRole.HEAD_OF_DEPARTMENTS]: 'Head of Departments',
  [UserRole.ADMIN]: 'Platform Admin',
};
