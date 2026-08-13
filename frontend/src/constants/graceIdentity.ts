/** GRACE AI branding — do not alter team register numbers or core objectives. */

export const GRACE_SUBTITLE =
  'AI-Powered Grievance Redressal and Citizen Engagement Platform';

export const GRACE_OBJECTIVES = [
  'Automate complaint classification using AI',
  'Predict SLA violations',
  'Detect duplicate complaints',
  'Provide real-time grievance tracking',
  'Generate analytics for authorities',
] as const;

export const PROBLEM_STATEMENTS = [
  'Delayed responses',
  'Lack of transparency',
  'Fragmented communication',
  'Manual complaint classification',
  'Incorrect department routing',
  'Difficulty tracking grievances',
  'Duplicate complaints',
  'Missed SLA deadlines',
  'Limited analytics for authorities',
] as const;

export const AGILE_FORCES_TEAM = [
  { name: 'VISHVA G', register: '711525BAD183' },
  { name: 'ANUSHIYA M', register: '711525BAD023' },
  { name: 'SYAM ROSARIO F A', register: '711525BAD165' },
] as const;

export const WORKFLOW_STEPS = [
  { key: 'submit', title: 'Submit', desc: 'Citizen reports a public issue through the web app' },
  { key: 'ai', title: 'AI Analysis', desc: 'GRACE classifies, routes, and predicts SLA risk' },
  { key: 'route', title: 'Smart Routing', desc: 'Complaint reaches the responsible department' },
  { key: 'action', title: 'Action', desc: 'Officers assign, investigate, and update status' },
  { key: 'track', title: 'Tracking', desc: 'Citizens follow every status change in real time' },
  { key: 'resolve', title: 'Resolution', desc: 'Issue resolved with notifications and feedback' },
] as const;
