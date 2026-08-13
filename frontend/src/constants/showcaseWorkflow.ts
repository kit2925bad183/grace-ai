import { POSTER_JOURNEY } from '@/utils/civicLanguage';
import { DEMO_SAMPLE_GRIEVANCE } from './demoAccounts';

export type ShowcaseRole = 'all' | 'citizen' | 'department' | 'head' | 'admin';

export interface ShowcaseStep {
  id: number;
  phase: string;
  role: ShowcaseRole;
  title: string;
  actions: string[];
  path?: string;
  highlight?: string;
}

/** Full end-to-end workflow for judges and demos. */
export const FULL_SHOWCASE_WORKFLOW: ShowcaseStep[] = [
  {
    id: 1,
    phase: 'Introduction',
    role: 'all',
    title: 'Problem & platform overview',
    actions: [
      'Government grievances are manually classified, incorrectly routed, and hard to track.',
      'GRACE AI delivers AI classification, smart routing, duplicate detection, SLA prediction, and transparent tracking.',
      'Open the landing page — show live MongoDB-backed governance stats.',
    ],
    path: '/',
  },
  {
    id: 2,
    phase: 'Citizen',
    role: 'citizen',
    title: 'Citizen login',
    actions: [
      'Login as citizen@grace.demo / Demo@1234 (or use Quick Access on login).',
      'Citizen dashboard shows active complaints, notifications, and quick actions.',
    ],
    path: '/login',
    highlight: 'citizen@grace.demo',
  },
  {
    id: 3,
    phase: 'Citizen',
    role: 'citizen',
    title: 'Register a new grievance',
    actions: [
      'Navigate to Register Grievance.',
      `Title: "${DEMO_SAMPLE_GRIEVANCE.title}"`,
      `Description: "${DEMO_SAMPLE_GRIEVANCE.description}"`,
      'Select category: Road Infrastructure · pick a ward · enter location.',
    ],
    path: '/user/complaints/new',
  },
  {
    id: 4,
    phase: 'Citizen',
    role: 'citizen',
    title: 'AI analysis before submit',
    actions: [
      'Click "Analyze with GRACE AI".',
      'Show: suggested category, department, priority, duplicate probability, SLA risk, AI confidence, recommendation.',
      'Say: "AI inference runs before persistence — officers see the same analysis."',
    ],
    path: '/user/complaints/new',
  },
  {
    id: 5,
    phase: 'Citizen',
    role: 'citizen',
    title: 'Submit & receive grievance ID',
    actions: [
      'Submit the grievance.',
      'Show generated ID (e.g. GRV-2026-XXXX) — persisted in MongoDB.',
      'Open complaint detail — timeline starts at Submitted → AI Classified.',
    ],
    path: '/user/complaints',
  },
  {
    id: 6,
    phase: 'Citizen',
    role: 'citizen',
    title: 'Public tracking (no login)',
    actions: [
      'Copy grievance ID.',
      'Open Track Grievance (or /track/:id) — citizen can share the link.',
      'Timeline shows every status change with timestamps from status history.',
    ],
    path: '/user/track',
  },
  {
    id: 7,
    phase: 'Department',
    role: 'department',
    title: 'Department receives & assigns',
    actions: [
      'Logout → login as roads@grace.ai / Demo@1234.',
      'Open Command Center / Grievances — find the new complaint (or search GRV ID).',
      'Show AI analysis panel, SLA indicator, duplicate flags on the same record.',
      'Assign Roads Officer → set status to IN_PROGRESS.',
    ],
    path: '/department/complaints',
    highlight: 'roads@grace.ai',
  },
  {
    id: 8,
    phase: 'Citizen',
    role: 'citizen',
    title: 'Real-time transparency',
    actions: [
      'Logout → login as citizen again.',
      'My Complaints shows IN_PROGRESS — same data from backend.',
      'Notifications bell shows department update.',
      'Say: "Citizen and authority read the same MongoDB record."',
    ],
    path: '/user/complaints',
  },
  {
    id: 9,
    phase: 'Department',
    role: 'department',
    title: 'Resolve & close',
    actions: [
      'Department sets status RESOLVED, then CLOSED.',
      'Optional: citizen submits star rating + feedback comment after resolution.',
    ],
    path: '/department/complaints',
  },
  {
    id: 10,
    phase: 'Head',
    role: 'head',
    title: 'Leadership analytics',
    actions: [
      'Login as head@grace.demo — Head Command Center.',
      'Analytics: complaint trends, department performance, categories, SLA compliance.',
      'Hotspots map, root-cause intelligence, forecast, AI governance recommendations.',
      'Policy Impact — show data-driven insights (not hardcoded charts).',
    ],
    path: '/head/analytics',
    highlight: 'head@grace.demo',
  },
  {
    id: 11,
    phase: 'Head',
    role: 'head',
    title: 'SLA & duplicates',
    actions: [
      'SLA Monitoring — at-risk and breached cases from live data.',
      'Duplicates — review flagged similar complaints and merge decisions.',
    ],
    path: '/head/sla',
  },
  {
    id: 12,
    phase: 'Admin',
    role: 'admin',
    title: 'Platform administration',
    actions: [
      'Login as admin@grace.demo — Admin dashboard.',
      'Manage departments, department heads, users, security events.',
      'Audit logs and system health (/admin/health).',
    ],
    path: '/admin/dashboard',
    highlight: 'admin@grace.demo',
  },
  {
    id: 13,
    phase: 'Closing',
    role: 'all',
    title: 'Judge talking points',
    actions: [
      'AI: rule-based inference today; modular interface for future NLP/ML models.',
      'MongoDB: grievances, AI analysis, SLA, history, notifications, analytics — all persisted.',
      'Auth: bcrypt + JWT httpOnly cookies; role-based access on every API.',
    ],
  },
];

/** 5-minute condensed script aligned with README judge demo. */
export const JUDGE_DEMO_TIMELINE = [
  { time: '0:00', title: 'Problem', detail: 'Manual classification, wrong routing, no citizen visibility.' },
  { time: '0:30', title: 'GRACE AI', detail: 'AI classification, routing, duplicates, SLA, tracking, analytics.' },
  { time: '1:00', title: 'Citizen flow', detail: 'Login → register pothole grievance → Analyze with GRACE AI → submit.' },
  { time: '2:00', title: 'Persistence', detail: 'Show MongoDB-backed timeline and public track link.' },
  { time: '2:30', title: 'Authority', detail: 'Department/Head finds same GRV ID → assign → IN_PROGRESS.' },
  { time: '3:30', title: 'Transparency', detail: 'Citizen sees update + notification immediately.' },
  { time: '4:00', title: 'Resolution', detail: 'Authority RESOLVED → citizen confirms → feedback optional.' },
  { time: '4:30', title: 'Intelligence', detail: 'Head analytics, hotspots, SLA, duplicates — all API-driven.' },
  { time: '5:00', title: 'Close', detail: 'Database-backed grievance lifecycle connecting citizens and authorities.' },
] as const;

export const POSTER_WORKFLOW = POSTER_JOURNEY.map((step, i) => ({
  order: i + 1,
  ...step,
}));

export const DEPLOYMENT_LINKS = {
  frontend: import.meta.env.VITE_APP_URL || 'https://frontend-six-nu-69.vercel.app',
  api: import.meta.env.VITE_API_ORIGIN || 'https://grace-ai-e7m3.onrender.com',
  health: `${import.meta.env.VITE_API_URL || 'https://grace-ai-e7m3.onrender.com/api'}/health`,
} as const;
