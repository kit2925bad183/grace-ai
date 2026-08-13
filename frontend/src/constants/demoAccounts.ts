import type { UserRole } from '@/types';

export const DEMO_PASSWORD = 'Demo@1234';

export interface DemoAccount {
  key: string;
  label: string;
  email: string;
  role: UserRole;
  portal: string;
  description: string;
}

/** Seeded demo accounts — run `npm run seed` in backend (dev only). */
export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    key: 'citizen',
    label: 'Citizen',
    email: 'citizen@grace.demo',
    role: 'CITIZEN',
    portal: '/user/dashboard',
    description: 'Submit grievances, track status, receive notifications',
  },
  {
    key: 'department',
    label: 'Roads Department',
    email: 'roads@grace.ai',
    role: 'DEPARTMENT',
    portal: '/department/dashboard',
    description: 'View assigned complaints, update status, assign officers',
  },
  {
    key: 'head',
    label: 'Head of Departments',
    email: 'head@grace.demo',
    role: 'HEAD_OF_DEPARTMENTS',
    portal: '/head/dashboard',
    description: 'Cross-department analytics, hotspots, AI insights, policy impact',
  },
  {
    key: 'admin',
    label: 'Platform Admin',
    email: 'admin@grace.demo',
    role: 'ADMIN',
    portal: '/admin/dashboard',
    description: 'User management, departments, audit logs, system health',
  },
];

export const DEMO_SAMPLE_GRIEVANCE = {
  title: 'Large pothole near school',
  description:
    'There is a large pothole near the school entrance and several vehicles are getting damaged.',
  category: 'Road Infrastructure',
  trackId: 'GRV-2026-1015',
};
