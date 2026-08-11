import {
  AnalysisMethod,
  DuplicateMatchStatus,
  GrievanceStatus,
  NotificationType,
  Priority,
  SLARiskLevel,
} from '../src/models/enums';

export const DEMO_PASSWORD = 'Demo@1234';
export const BCRYPT_ROUNDS = 10;

export interface DepartmentSeed {
  name: string;
  code: string;
  description: string;
  contactEmail: string;
}

export interface CategorySeed {
  name: string;
  description: string;
  departmentCode: string;
}

export interface WardSeed {
  name: string;
  code: string;
  description: string;
}

export interface UserSeed {
  name: string;
  email: string;
  role: string;
  phone: string;
}

export interface OfficerSeed {
  email: string;
  departmentCode: string;
  employeeCode: string;
  designation: string;
  wardCodes: string[];
}

export interface GrievanceTemplate {
  grievanceId: string;
  title: string;
  description: string;
  categoryName: string;
  wardCode: string;
  location: string;
  priority: Priority;
  status: GrievanceStatus;
  daysAgo: number;
  citizenEmail?: string;
}

export const DEPARTMENTS: DepartmentSeed[] = [
  {
    name: 'Municipal Corporation — Roads Division',
    code: 'ROADS',
    description: 'Road infrastructure maintenance and repair',
    contactEmail: 'roads@municipal.gov',
  },
  {
    name: 'Municipal Corporation — Electrical Division',
    code: 'ELECTRICAL',
    description: 'Street lighting and electrical infrastructure',
    contactEmail: 'electrical@municipal.gov',
  },
  {
    name: 'Water Board',
    code: 'WATER',
    description: 'Water supply and pipeline management',
    contactEmail: 'water@board.gov',
  },
  {
    name: 'Sanitation Department',
    code: 'SANITATION',
    description: 'Waste collection and sanitation services',
    contactEmail: 'sanitation@municipal.gov',
  },
  {
    name: 'Public Health Department',
    code: 'HEALTH',
    description: 'Public healthcare and hygiene services',
    contactEmail: 'health@municipal.gov',
  },
  {
    name: 'Education Department',
    code: 'EDUCATION',
    description: 'Public education infrastructure and services',
    contactEmail: 'education@municipal.gov',
  },
  {
    name: 'Public Safety Department',
    code: 'SAFETY',
    description: 'Public safety and emergency response',
    contactEmail: 'safety@municipal.gov',
  },
  {
    name: 'Public Transport Department',
    code: 'TRANSPORT',
    description: 'Public transport infrastructure and services',
    contactEmail: 'transport@municipal.gov',
  },
];

export const CATEGORIES: CategorySeed[] = [
  { name: 'Road Infrastructure', description: 'Roads, potholes, and street damage', departmentCode: 'ROADS' },
  { name: 'Water Supply', description: 'Water supply interruptions and pipeline issues', departmentCode: 'WATER' },
  { name: 'Electricity', description: 'Street lighting and power issues', departmentCode: 'ELECTRICAL' },
  { name: 'Sanitation', description: 'Garbage collection and waste management', departmentCode: 'SANITATION' },
  { name: 'Healthcare', description: 'Public health and medical services', departmentCode: 'HEALTH' },
  { name: 'Education', description: 'Schools and educational facilities', departmentCode: 'EDUCATION' },
  { name: 'Public Safety', description: 'Safety hazards and emergency concerns', departmentCode: 'SAFETY' },
  { name: 'Public Transport', description: 'Bus stops, routes, and transport issues', departmentCode: 'TRANSPORT' },
  { name: 'Other', description: 'General complaints not covered by other categories', departmentCode: 'ROADS' },
];

export const WARDS: WardSeed[] = [
  { name: 'Ward 7', code: 'W07', description: 'Central residential and commercial zone' },
  { name: 'Ward 12', code: 'W12', description: 'Northern suburban area' },
  { name: 'Ward 14', code: 'W14', description: 'Industrial and residential mix' },
  { name: 'Ward 18', code: 'W18', description: 'Eastern market district' },
  { name: 'Ward 21', code: 'W21', description: 'Southern educational hub' },
  { name: 'Ward 25', code: 'W25', description: 'Western transport corridor' },
];

export const USERS: UserSeed[] = [
  { name: 'Demo Citizen', email: 'citizen@grace.demo', role: 'CITIZEN', phone: '9876543210' },
  { name: 'Demo Authority', email: 'authority@grace.demo', role: 'AUTHORITY', phone: '9876543211' },
  { name: 'System Admin', email: 'admin@grace.demo', role: 'ADMIN', phone: '9876543212' },
  { name: 'Rajesh Kumar', email: 'roads.officer@grace.demo', role: 'OFFICER', phone: '9876543213' },
  { name: 'Priya Sharma', email: 'water.officer@grace.demo', role: 'OFFICER', phone: '9876543214' },
  { name: 'Amit Patel', email: 'sanitation.officer@grace.demo', role: 'OFFICER', phone: '9876543215' },
  { name: 'Anita Desai', email: 'anita.citizen@grace.demo', role: 'CITIZEN', phone: '9876543216' },
  { name: 'Ravi Menon', email: 'ravi.citizen@grace.demo', role: 'CITIZEN', phone: '9876543217' },
  { name: 'Sunita Rao', email: 'sunita.citizen@grace.demo', role: 'CITIZEN', phone: '9876543218' },
];

export const OFFICERS: OfficerSeed[] = [
  {
    email: 'roads.officer@grace.demo',
    departmentCode: 'ROADS',
    employeeCode: 'OFF-ROADS-001',
    designation: 'Roads Field Officer',
    wardCodes: ['W07', 'W14', 'W21'],
  },
  {
    email: 'water.officer@grace.demo',
    departmentCode: 'WATER',
    employeeCode: 'OFF-WATER-001',
    designation: 'Water Supply Officer',
    wardCodes: ['W07', 'W12', 'W18'],
  },
  {
    email: 'sanitation.officer@grace.demo',
    departmentCode: 'SANITATION',
    employeeCode: 'OFF-SAN-001',
    designation: 'Sanitation Supervisor',
    wardCodes: ['W12', 'W14', 'W25'],
  },
];

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

export function getSlaDeadline(priority: Priority, createdAt: Date): Date {
  const daysMap: Record<Priority, number> = {
    [Priority.LOW]: 14,
    [Priority.MEDIUM]: 7,
    [Priority.HIGH]: 4,
    [Priority.CRITICAL]: 2,
  };
  return addDays(createdAt, daysMap[priority]);
}

export function buildStatusFlow(finalStatus: GrievanceStatus): GrievanceStatus[] {
  const baseFlow: GrievanceStatus[] = [
    GrievanceStatus.SUBMITTED,
    GrievanceStatus.AI_ANALYZED,
  ];

  const extendedFlows: Record<GrievanceStatus, GrievanceStatus[]> = {
    [GrievanceStatus.SUBMITTED]: [GrievanceStatus.SUBMITTED],
    [GrievanceStatus.AI_ANALYZED]: [...baseFlow],
    [GrievanceStatus.ASSIGNED]: [...baseFlow, GrievanceStatus.ASSIGNED],
    [GrievanceStatus.UNDER_REVIEW]: [...baseFlow, GrievanceStatus.ASSIGNED, GrievanceStatus.UNDER_REVIEW],
    [GrievanceStatus.IN_PROGRESS]: [...baseFlow, GrievanceStatus.ASSIGNED, GrievanceStatus.IN_PROGRESS],
    [GrievanceStatus.ESCALATED]: [...baseFlow, GrievanceStatus.ASSIGNED, GrievanceStatus.IN_PROGRESS, GrievanceStatus.ESCALATED],
    [GrievanceStatus.RESOLVED]: [...baseFlow, GrievanceStatus.ASSIGNED, GrievanceStatus.IN_PROGRESS, GrievanceStatus.RESOLVED],
    [GrievanceStatus.CLOSED]: [...baseFlow, GrievanceStatus.ASSIGNED, GrievanceStatus.IN_PROGRESS, GrievanceStatus.RESOLVED, GrievanceStatus.CLOSED],
    [GrievanceStatus.REJECTED]: [...baseFlow, GrievanceStatus.REJECTED],
  };

  return extendedFlows[finalStatus];
}

export interface AnalysisResult {
  category: string;
  department: string;
  priority: Priority;
  duplicateProbability: number;
  slaRisk: SLARiskLevel;
  estimatedResolutionDays: number;
  confidence: number;
  detectedKeywords: string[];
  recommendation: string;
}

export function analyzeComplaint(description: string, title: string): AnalysisResult {
  const text = `${title} ${description}`.toLowerCase();

  const rules: Array<{
    keywords: string[];
    category: string;
    department: string;
    priority: Priority;
    recommendation: string;
  }> = [
    {
      keywords: ['pothole', 'road damage', 'road broken', 'street road', 'crater', 'asphalt'],
      category: 'Road Infrastructure',
      department: 'Municipal Corporation — Roads Division',
      priority: Priority.HIGH,
      recommendation: 'Prioritize field inspection due to proximity to school.',
    },
    {
      keywords: ['water', 'pipeline', 'no water', 'water supply', 'leak', 'tap'],
      category: 'Water Supply',
      department: 'Water Board',
      priority: Priority.HIGH,
      recommendation: 'Dispatch pipeline inspection team immediately.',
    },
    {
      keywords: ['garbage', 'waste', 'trash', 'collection', 'dump', 'bin'],
      category: 'Sanitation',
      department: 'Sanitation Department',
      priority: Priority.MEDIUM,
      recommendation: 'Schedule immediate waste collection and area sanitization.',
    },
    {
      keywords: ['streetlight', 'street light', 'lamp', 'dark', 'lighting', 'electricity'],
      category: 'Electricity',
      department: 'Municipal Corporation — Electrical Division',
      priority: Priority.MEDIUM,
      recommendation: 'Assign electrical maintenance crew for inspection.',
    },
    {
      keywords: ['drainage', 'sewer', 'overflow', 'flooding', 'blocked drain'],
      category: 'Sanitation',
      department: 'Sanitation Department',
      priority: Priority.HIGH,
      recommendation: 'Emergency drainage clearance required before rainfall.',
    },
    {
      keywords: ['hospital', 'clinic', 'health', 'medical', 'ambulance'],
      category: 'Healthcare',
      department: 'Public Health Department',
      priority: Priority.HIGH,
      recommendation: 'Escalate to public health officer for assessment.',
    },
    {
      keywords: ['school', 'education', 'classroom', 'teacher'],
      category: 'Education',
      department: 'Education Department',
      priority: Priority.MEDIUM,
      recommendation: 'Coordinate with education department for facility review.',
    },
    {
      keywords: ['crime', 'theft', 'safety', 'police', 'security'],
      category: 'Public Safety',
      department: 'Public Safety Department',
      priority: Priority.CRITICAL,
      recommendation: 'Immediate safety assessment and patrol deployment.',
    },
    {
      keywords: ['bus', 'transport', 'route', 'stop', 'metro'],
      category: 'Public Transport',
      department: 'Public Transport Department',
      priority: Priority.MEDIUM,
      recommendation: 'Review transport schedule and infrastructure.',
    },
  ];

  for (const rule of rules) {
    const matched = rule.keywords.filter((kw) => text.includes(kw));
    if (matched.length > 0) {
      const isSchoolPothole =
        text.includes('pothole') &&
        text.includes('school') &&
        (text.includes('vehicle') || text.includes('damage'));

      return {
        category: rule.category,
        department: rule.department,
        priority: isSchoolPothole ? Priority.HIGH : rule.priority,
        duplicateProbability: isSchoolPothole ? 12 : Math.floor(Math.random() * 30) + 5,
        slaRisk: isSchoolPothole ? SLARiskLevel.LOW : SLARiskLevel.MEDIUM,
        estimatedResolutionDays: isSchoolPothole ? 4 : rule.priority === Priority.CRITICAL ? 2 : 5,
        confidence: isSchoolPothole ? 94 : Math.floor(Math.random() * 15) + 80,
        detectedKeywords: matched,
        recommendation: isSchoolPothole
          ? 'Prioritize field inspection due to proximity to school.'
          : rule.recommendation,
      };
    }
  }

  return {
    category: 'Other',
    department: 'Municipal Corporation — Roads Division',
    priority: Priority.MEDIUM,
    duplicateProbability: 8,
    slaRisk: SLARiskLevel.LOW,
    estimatedResolutionDays: 7,
    confidence: 75,
    detectedKeywords: [],
    recommendation: 'Route to appropriate department for manual review.',
  };
}

export function computeSlaPrediction(
  priority: Priority,
  createdAt: Date,
  slaDeadline: Date,
  status: GrievanceStatus
): {
  riskLevel: SLARiskLevel;
  riskPercentage: number;
  remainingHours: number;
  predictedResolutionDate: Date;
  recommendation: string;
} {
  const now = new Date();
  const totalMs = slaDeadline.getTime() - createdAt.getTime();
  const elapsedMs = now.getTime() - createdAt.getTime();
  const remainingMs = slaDeadline.getTime() - now.getTime();
  const remainingHours = Math.max(0, Math.round(remainingMs / (1000 * 60 * 60)));

  let riskPercentage: number;
  if (status === GrievanceStatus.RESOLVED || status === GrievanceStatus.CLOSED) {
    riskPercentage = 0;
  } else if (remainingMs <= 0) {
    riskPercentage = Math.min(99, 85 + Math.floor(Math.random() * 14));
  } else {
    const elapsedRatio = elapsedMs / totalMs;
    riskPercentage = Math.min(99, Math.round(elapsedRatio * 100));
  }

  let riskLevel: SLARiskLevel;
  if (riskPercentage >= 80) riskLevel = SLARiskLevel.CRITICAL;
  else if (riskPercentage >= 60) riskLevel = SLARiskLevel.HIGH;
  else if (riskPercentage >= 35) riskLevel = SLARiskLevel.MEDIUM;
  else riskLevel = SLARiskLevel.LOW;

  const resolutionDaysMap: Record<Priority, number> = {
    [Priority.LOW]: 10,
    [Priority.MEDIUM]: 5,
    [Priority.HIGH]: 3,
    [Priority.CRITICAL]: 1,
  };
  const predictedResolutionDate = addDays(createdAt, resolutionDaysMap[priority]);

  const recommendations: Record<SLARiskLevel, string> = {
    [SLARiskLevel.LOW]: 'Monitor progress and maintain current allocation.',
    [SLARiskLevel.MEDIUM]: 'Review case progress and consider resource reallocation.',
    [SLARiskLevel.HIGH]: 'Escalate to senior officer and prioritize field inspection.',
    [SLARiskLevel.CRITICAL]: 'Immediate escalation required — SLA breach imminent or overdue.',
  };

  return {
    riskLevel,
    riskPercentage,
    remainingHours,
    predictedResolutionDate,
    recommendation: recommendations[riskLevel],
  };
}

export const GRIEVANCE_TEMPLATES: GrievanceTemplate[] = [
  {
    grievanceId: 'GRV-2026-1015',
    title: 'Large pothole near school entrance',
    description: 'Large pothole near the school entrance causing vehicle damage.',
    categoryName: 'Road Infrastructure',
    wardCode: 'W21',
    location: 'School Road, Near Green Valley School, Ward 21',
    priority: Priority.HIGH,
    status: GrievanceStatus.ASSIGNED,
    daysAgo: 3,
  },
  {
    grievanceId: 'GRV-2026-1034',
    title: 'Pothole causing traffic problems near school',
    description: 'Pothole causing traffic problems near school area.',
    categoryName: 'Road Infrastructure',
    wardCode: 'W21',
    location: 'School Road Junction, Ward 21',
    priority: Priority.HIGH,
    status: GrievanceStatus.AI_ANALYZED,
    daysAgo: 2,
  },
  {
    grievanceId: 'GRV-2026-1047',
    title: 'Road damage close to school gate',
    description: 'Road damage close to school gate affecting daily commute.',
    categoryName: 'Road Infrastructure',
    wardCode: 'W21',
    location: 'Green Valley School Gate, Ward 21',
    priority: Priority.MEDIUM,
    status: GrievanceStatus.SUBMITTED,
    daysAgo: 1,
  },
  {
    grievanceId: 'GRV-2026-1001',
    title: 'Water supply interrupted for two days',
    description: 'No water supply in our area for the past two days. Pipeline may be damaged.',
    categoryName: 'Water Supply',
    wardCode: 'W07',
    location: 'Patel Nagar Block C, Ward 7',
    priority: Priority.HIGH,
    status: GrievanceStatus.IN_PROGRESS,
    daysAgo: 5,
  },
  {
    grievanceId: 'GRV-2026-1002',
    title: 'Garbage not collected for four days',
    description: 'Garbage has not been collected for four consecutive days causing foul smell.',
    categoryName: 'Sanitation',
    wardCode: 'W12',
    location: 'Lake View Colony, Ward 12',
    priority: Priority.MEDIUM,
    status: GrievanceStatus.ASSIGNED,
    daysAgo: 4,
  },
  {
    grievanceId: 'GRV-2026-1003',
    title: 'Streetlight not working near bus stop',
    description: 'Streetlight not working near the main bus stop creating safety concerns at night.',
    categoryName: 'Electricity',
    wardCode: 'W18',
    location: 'Central Bus Stop, Ward 18',
    priority: Priority.MEDIUM,
    status: GrievanceStatus.UNDER_REVIEW,
    daysAgo: 6,
  },
  {
    grievanceId: 'GRV-2026-1004',
    title: 'Drainage overflow during rainfall',
    description: 'Drainage system overflows during rainfall flooding the street.',
    categoryName: 'Sanitation',
    wardCode: 'W14',
    location: 'Industrial Area Road, Ward 14',
    priority: Priority.HIGH,
    status: GrievanceStatus.ESCALATED,
    daysAgo: 7,
  },
  {
    grievanceId: 'GRV-2026-1005',
    title: 'Broken footpath tiles causing accidents',
    description: 'Several footpath tiles are broken near the market causing pedestrian accidents.',
    categoryName: 'Road Infrastructure',
    wardCode: 'W18',
    location: 'Main Market Road, Ward 18',
    priority: Priority.MEDIUM,
    status: GrievanceStatus.RESOLVED,
    daysAgo: 15,
  },
  {
    grievanceId: 'GRV-2026-1006',
    title: 'Low water pressure in morning hours',
    description: 'Water pressure is extremely low during morning hours affecting daily routines.',
    categoryName: 'Water Supply',
    wardCode: 'W07',
    location: 'Shanti Enclave, Ward 7',
    priority: Priority.MEDIUM,
    status: GrievanceStatus.IN_PROGRESS,
    daysAgo: 8,
  },
  {
    grievanceId: 'GRV-2026-1007',
    title: 'Illegal dumping of construction waste',
    description: 'Construction waste being illegally dumped on vacant plot near residential area.',
    categoryName: 'Sanitation',
    wardCode: 'W25',
    location: 'Transport Corridor Plot 12, Ward 25',
    priority: Priority.HIGH,
    status: GrievanceStatus.ASSIGNED,
    daysAgo: 3,
  },
  {
    grievanceId: 'GRV-2026-1008',
    title: 'Damaged speed bump on main road',
    description: 'Speed bump on main road is damaged and causing vehicle damage.',
    categoryName: 'Road Infrastructure',
    wardCode: 'W14',
    location: 'Highway Connector, Ward 14',
    priority: Priority.LOW,
    status: GrievanceStatus.CLOSED,
    daysAgo: 20,
  },
  {
    grievanceId: 'GRV-2026-1009',
    title: 'Contaminated water supply detected',
    description: 'Residents reporting muddy and contaminated water from municipal taps.',
    categoryName: 'Water Supply',
    wardCode: 'W12',
    location: 'Northern Suburb Block A, Ward 12',
    priority: Priority.CRITICAL,
    status: GrievanceStatus.ESCALATED,
    daysAgo: 2,
  },
  {
    grievanceId: 'GRV-2026-1010',
    title: 'Bus stop shelter damaged in storm',
    description: 'Bus stop shelter was damaged during recent storm, no seating available.',
    categoryName: 'Public Transport',
    wardCode: 'W25',
    location: 'Metro Junction Stop, Ward 25',
    priority: Priority.MEDIUM,
    status: GrievanceStatus.IN_PROGRESS,
    daysAgo: 5,
  },
  {
    grievanceId: 'GRV-2026-1011',
    title: 'Open manhole on residential street',
    description: 'Manhole cover is missing on residential street posing serious safety hazard.',
    categoryName: 'Public Safety',
    wardCode: 'W07',
    location: 'Rose Garden Lane, Ward 7',
    priority: Priority.CRITICAL,
    status: GrievanceStatus.IN_PROGRESS,
    daysAgo: 1,
  },
  {
    grievanceId: 'GRV-2026-1012',
    title: 'School boundary wall crumbling',
    description: 'Boundary wall of government school is crumbling and needs urgent repair.',
    categoryName: 'Education',
    wardCode: 'W21',
    location: 'Govt. Primary School, Ward 21',
    priority: Priority.HIGH,
    status: GrievanceStatus.ASSIGNED,
    daysAgo: 10,
  },
  {
    grievanceId: 'GRV-2026-1013',
    title: 'Flickering street lights entire block',
    description: 'All street lights on Block D flickering intermittently for a week.',
    categoryName: 'Electricity',
    wardCode: 'W12',
    location: 'Block D, Ward 12',
    priority: Priority.MEDIUM,
    status: GrievanceStatus.AI_ANALYZED,
    daysAgo: 4,
  },
  {
    grievanceId: 'GRV-2026-1014',
    title: 'Overflowing public toilet facility',
    description: 'Public toilet near park is overflowing and creating health hazard.',
    categoryName: 'Sanitation',
    wardCode: 'W18',
    location: 'City Park Entrance, Ward 18',
    priority: Priority.HIGH,
    status: GrievanceStatus.RESOLVED,
    daysAgo: 12,
  },
  {
    grievanceId: 'GRV-2026-1016',
    title: 'Pipeline burst flooding street',
    description: 'Water pipeline burst on main street causing flooding and traffic disruption.',
    categoryName: 'Water Supply',
    wardCode: 'W07',
    location: 'Central Avenue, Ward 7',
    priority: Priority.CRITICAL,
    status: GrievanceStatus.RESOLVED,
    daysAgo: 9,
  },
  {
    grievanceId: 'GRV-2026-1017',
    title: 'Uneven road surface after repair',
    description: 'Road repair left uneven surface causing accidents for two-wheelers.',
    categoryName: 'Road Infrastructure',
    wardCode: 'W14',
    location: 'Factory Road, Ward 14',
    priority: Priority.MEDIUM,
    status: GrievanceStatus.IN_PROGRESS,
    daysAgo: 6,
  },
  {
    grievanceId: 'GRV-2026-1018',
    title: 'Stray dogs near garbage dump site',
    description: 'Large number of stray dogs congregating near garbage dump creating safety issue.',
    categoryName: 'Public Safety',
    wardCode: 'W12',
    location: 'Dump Site Road, Ward 12',
    priority: Priority.MEDIUM,
    status: GrievanceStatus.UNDER_REVIEW,
    daysAgo: 7,
  },
  {
    grievanceId: 'GRV-2026-1019',
    title: 'Missing road signage at intersection',
    description: 'Important road signage missing at busy intersection causing confusion.',
    categoryName: 'Road Infrastructure',
    wardCode: 'W25',
    location: 'Transport Hub Intersection, Ward 25',
    priority: Priority.LOW,
    status: GrievanceStatus.AI_ANALYZED,
    daysAgo: 3,
  },
  {
    grievanceId: 'GRV-2026-1020',
    title: 'Clinic waiting area overcrowded',
    description: 'Public clinic waiting area severely overcrowded, need additional staff.',
    categoryName: 'Healthcare',
    wardCode: 'W07',
    location: 'Community Health Center, Ward 7',
    priority: Priority.HIGH,
    status: GrievanceStatus.ASSIGNED,
    daysAgo: 4,
  },
  {
    grievanceId: 'GRV-2026-1021',
    title: 'Water tanker not arriving on schedule',
    description: 'Municipal water tanker has not arrived for three days in drought-affected area.',
    categoryName: 'Water Supply',
    wardCode: 'W14',
    location: 'Workers Colony, Ward 14',
    priority: Priority.HIGH,
    status: GrievanceStatus.IN_PROGRESS,
    daysAgo: 3,
  },
  {
    grievanceId: 'GRV-2026-1022',
    title: 'Damaged zebra crossing faded',
    description: 'Zebra crossing markings completely faded near school zone.',
    categoryName: 'Road Infrastructure',
    wardCode: 'W21',
    location: 'School Zone Crossing, Ward 21',
    priority: Priority.MEDIUM,
    status: GrievanceStatus.SUBMITTED,
    daysAgo: 2,
  },
  {
    grievanceId: 'GRV-2026-1023',
    title: 'Sewage smell from blocked drain',
    description: 'Persistent sewage smell from blocked drain affecting nearby homes.',
    categoryName: 'Sanitation',
    wardCode: 'W07',
    location: 'River Side Colony, Ward 7',
    priority: Priority.HIGH,
    status: GrievanceStatus.ESCALATED,
    daysAgo: 5,
  },
  {
    grievanceId: 'GRV-2026-1024',
    title: 'Bus route cancelled without notice',
    description: 'Morning bus route 42 cancelled without public notice affecting commuters.',
    categoryName: 'Public Transport',
    wardCode: 'W18',
    location: 'Route 42 Terminus, Ward 18',
    priority: Priority.MEDIUM,
    status: GrievanceStatus.REJECTED,
    daysAgo: 8,
  },
  {
    grievanceId: 'GRV-2026-1025',
    title: 'Playground equipment rusted and unsafe',
    description: 'Playground equipment in public park is rusted and unsafe for children.',
    categoryName: 'Public Safety',
    wardCode: 'W21',
    location: 'Children Park, Ward 21',
    priority: Priority.MEDIUM,
    status: GrievanceStatus.ASSIGNED,
    daysAgo: 11,
  },
  {
    grievanceId: 'GRV-2026-1026',
    title: 'Power outage affecting street lights',
    description: 'Extended power outage affecting all street lights in the neighborhood.',
    categoryName: 'Electricity',
    wardCode: 'W14',
    location: 'Industrial Estate, Ward 14',
    priority: Priority.HIGH,
    status: GrievanceStatus.RESOLVED,
    daysAgo: 14,
  },
  {
    grievanceId: 'GRV-2026-1027',
    title: 'Cracked water pipeline visible',
    description: 'Cracked water pipeline visible on roadside with water wastage.',
    categoryName: 'Water Supply',
    wardCode: 'W18',
    location: 'Market Back Lane, Ward 18',
    priority: Priority.HIGH,
    status: GrievanceStatus.IN_PROGRESS,
    daysAgo: 2,
  },
  {
    grievanceId: 'GRV-2026-1028',
    title: 'Accumulated trash near temple',
    description: 'Trash accumulated near temple entrance after festival celebrations.',
    categoryName: 'Sanitation',
    wardCode: 'W25',
    location: 'Temple Square, Ward 25',
    priority: Priority.MEDIUM,
    status: GrievanceStatus.CLOSED,
    daysAgo: 18,
  },
  {
    grievanceId: 'GRV-2026-1029',
    title: 'Road cave-in near construction site',
    description: 'Partial road cave-in near ongoing construction site.',
    categoryName: 'Road Infrastructure',
    wardCode: 'W07',
    location: 'Construction Zone B, Ward 7',
    priority: Priority.CRITICAL,
    status: GrievanceStatus.ESCALATED,
    daysAgo: 1,
  },
  {
    grievanceId: 'GRV-2026-1030',
    title: 'Ambulance access blocked by parked vehicles',
    description: 'Illegal parking blocking ambulance access to hospital lane.',
    categoryName: 'Public Safety',
    wardCode: 'W07',
    location: 'Hospital Lane, Ward 7',
    priority: Priority.CRITICAL,
    status: GrievanceStatus.IN_PROGRESS,
    daysAgo: 1,
  },
  {
    grievanceId: 'GRV-2026-1031',
    title: 'School roof leaking during monsoon',
    description: 'Government school roof leaking during monsoon affecting classroom operations.',
    categoryName: 'Education',
    wardCode: 'W12',
    location: 'Govt. High School, Ward 12',
    priority: Priority.HIGH,
    status: GrievanceStatus.ASSIGNED,
    daysAgo: 6,
  },
  {
    grievanceId: 'GRV-2026-1032',
    title: 'Bus frequency reduced on main route',
    description: 'Bus frequency on main route reduced causing overcrowding.',
    categoryName: 'Public Transport',
    wardCode: 'W25',
    location: 'Main Route Stop 5, Ward 25',
    priority: Priority.MEDIUM,
    status: GrievanceStatus.UNDER_REVIEW,
    daysAgo: 9,
  },
  {
    grievanceId: 'GRV-2026-1033',
    title: 'Mosquito breeding in stagnant water',
    description: 'Stagnant water accumulation leading to mosquito breeding near homes.',
    categoryName: 'Healthcare',
    wardCode: 'W14',
    location: 'Green Park Backside, Ward 14',
    priority: Priority.HIGH,
    status: GrievanceStatus.IN_PROGRESS,
    daysAgo: 4,
  },
  {
    grievanceId: 'GRV-2026-1035',
    title: 'Multiple potholes on connecting road',
    description: 'Multiple potholes on connecting road between wards causing daily commute issues.',
    categoryName: 'Road Infrastructure',
    wardCode: 'W12',
    location: 'Inter-Ward Connector, Ward 12',
    priority: Priority.HIGH,
    status: GrievanceStatus.ASSIGNED,
    daysAgo: 5,
  },
  {
    grievanceId: 'GRV-2026-1036',
    title: 'No street lighting in new colony',
    description: 'Newly developed colony has no street lighting installed yet.',
    categoryName: 'Electricity',
    wardCode: 'W21',
    location: 'New Colony Phase 2, Ward 21',
    priority: Priority.HIGH,
    status: GrievanceStatus.SUBMITTED,
    daysAgo: 2,
  },
  {
    grievanceId: 'GRV-2026-1037',
    title: 'Water meter reading dispute',
    description: 'Incorrect water meter reading leading to inflated bill charges.',
    categoryName: 'Water Supply',
    wardCode: 'W25',
    location: 'Transport Staff Quarters, Ward 25',
    priority: Priority.LOW,
    status: GrievanceStatus.CLOSED,
    daysAgo: 25,
  },
  {
    grievanceId: 'GRV-2026-1038',
    title: 'Dead animal on roadside not removed',
    description: 'Dead animal on roadside not removed for two days causing health hazard.',
    categoryName: 'Sanitation',
    wardCode: 'W18',
    location: 'Ring Road Section 3, Ward 18',
    priority: Priority.HIGH,
    status: GrievanceStatus.RESOLVED,
    daysAgo: 3,
  },
  {
    grievanceId: 'GRV-2026-1039',
    title: 'Traffic signal malfunction at junction',
    description: 'Traffic signal malfunctioning at major junction causing congestion.',
    categoryName: 'Public Safety',
    wardCode: 'W14',
    location: 'Major Junction 4, Ward 14',
    priority: Priority.CRITICAL,
    status: GrievanceStatus.IN_PROGRESS,
    daysAgo: 1,
  },
  {
    grievanceId: 'GRV-2026-1040',
    title: 'Library books damaged by leak',
    description: 'Public library books damaged due to roof leak during rains.',
    categoryName: 'Education',
    wardCode: 'W18',
    location: 'Public Library, Ward 18',
    priority: Priority.MEDIUM,
    status: GrievanceStatus.RESOLVED,
    daysAgo: 16,
  },
  {
    grievanceId: 'GRV-2026-1041',
    title: 'Footpath encroached by vendors',
    description: 'Footpath completely encroached by street vendors blocking pedestrian access.',
    categoryName: 'Other',
    wardCode: 'W18',
    location: 'Commercial Street, Ward 18',
    priority: Priority.MEDIUM,
    status: GrievanceStatus.UNDER_REVIEW,
    daysAgo: 7,
  },
  {
    grievanceId: 'GRV-2026-1042',
    title: 'Water pipeline maintenance overdue',
    description: 'Scheduled water pipeline maintenance overdue in residential sector.',
    categoryName: 'Water Supply',
    wardCode: 'W07',
    location: 'Residential Sector 3, Ward 7',
    priority: Priority.MEDIUM,
    status: GrievanceStatus.ASSIGNED,
    daysAgo: 6,
  },
  {
    grievanceId: 'GRV-2026-1043',
    title: 'Broken bench at bus shelter',
    description: 'All benches at bus shelter broken and unusable for elderly commuters.',
    categoryName: 'Public Transport',
    wardCode: 'W12',
    location: 'North Bus Terminal, Ward 12',
    priority: Priority.LOW,
    status: GrievanceStatus.AI_ANALYZED,
    daysAgo: 4,
  },
  {
    grievanceId: 'GRV-2026-1044',
    title: 'Recurring pothole despite repair',
    description: 'Same pothole reappeared within weeks after previous repair work.',
    categoryName: 'Road Infrastructure',
    wardCode: 'W07',
    location: 'Old City Road, Ward 7',
    priority: Priority.HIGH,
    status: GrievanceStatus.ESCALATED,
    daysAgo: 8,
  },
  {
    grievanceId: 'GRV-2026-1045',
    title: 'Garbage truck skipping collection route',
    description: 'Garbage collection truck consistently skipping our street on scheduled days.',
    categoryName: 'Sanitation',
    wardCode: 'W21',
    location: 'Teachers Colony, Ward 21',
    priority: Priority.MEDIUM,
    status: GrievanceStatus.IN_PROGRESS,
    daysAgo: 5,
  },
  {
    grievanceId: 'GRV-2026-1046',
    title: 'Hospital waste improperly disposed',
    description: 'Medical waste from nearby clinic improperly disposed in open area.',
    categoryName: 'Healthcare',
    wardCode: 'W07',
    location: 'Medical Lane, Ward 7',
    priority: Priority.CRITICAL,
    status: GrievanceStatus.ESCALATED,
    daysAgo: 2,
  },
  {
    grievanceId: 'GRV-2026-1048',
    title: 'Damaged guardrail on bridge',
    description: 'Guardrail on pedestrian bridge damaged and unsafe.',
    categoryName: 'Public Safety',
    wardCode: 'W25',
    location: 'Canal Bridge, Ward 25',
    priority: Priority.HIGH,
    status: GrievanceStatus.ASSIGNED,
    daysAgo: 4,
  },
  {
    grievanceId: 'GRV-2026-1049',
    title: 'School toilet facilities non-functional',
    description: 'Toilet facilities in government school non-functional for two weeks.',
    categoryName: 'Education',
    wardCode: 'W14',
    location: 'Secondary School Block B, Ward 14',
    priority: Priority.HIGH,
    status: GrievanceStatus.IN_PROGRESS,
    daysAgo: 3,
  },
  {
    grievanceId: 'GRV-2026-1050',
    title: 'Street vendor blocking fire hydrant',
    description: 'Street vendor permanently blocking fire hydrant access point.',
    categoryName: 'Public Safety',
    wardCode: 'W18',
    location: 'Fire Station Road, Ward 18',
    priority: Priority.HIGH,
    status: GrievanceStatus.RESOLVED,
    daysAgo: 10,
  },
  {
    grievanceId: 'GRV-2026-1051',
    title: 'Water quality test results pending',
    description: 'Requested water quality test three weeks ago, results still pending.',
    categoryName: 'Water Supply',
    wardCode: 'W12',
    location: 'Aqua Heights, Ward 12',
    priority: Priority.MEDIUM,
    status: GrievanceStatus.UNDER_REVIEW,
    daysAgo: 21,
  },
  {
    grievanceId: 'GRV-2026-1052',
    title: 'Road widening project debris not cleared',
    description: 'Debris from road widening project not cleared for over a month.',
    categoryName: 'Road Infrastructure',
    wardCode: 'W25',
    location: 'Widening Project Site, Ward 25',
    priority: Priority.MEDIUM,
    status: GrievanceStatus.ASSIGNED,
    daysAgo: 30,
  },
  {
    grievanceId: 'GRV-2026-1053',
    title: 'Night market noise and waste issue',
    description: 'Night market causing excessive noise and waste accumulation.',
    categoryName: 'Sanitation',
    wardCode: 'W18',
    location: 'Night Market Zone, Ward 18',
    priority: Priority.MEDIUM,
    status: GrievanceStatus.CLOSED,
    daysAgo: 22,
  },
  {
    grievanceId: 'GRV-2026-1054',
    title: 'Emergency phone at bus stop broken',
    description: 'Emergency phone at bus stop broken and out of service.',
    categoryName: 'Public Transport',
    wardCode: 'W07',
    location: 'Express Stop 2, Ward 7',
    priority: Priority.LOW,
    status: GrievanceStatus.RESOLVED,
    daysAgo: 11,
  },
  {
    grievanceId: 'GRV-2026-1055',
    title: 'Recurring water supply interruption Ward 7',
    description: 'Water supply interrupted every week in Ward 7 for past two months.',
    categoryName: 'Water Supply',
    wardCode: 'W07',
    location: 'Ward 7 Distribution Zone',
    priority: Priority.HIGH,
    status: GrievanceStatus.IN_PROGRESS,
    daysAgo: 14,
  },
];

export const DUPLICATE_CLUSTERS = [
  {
    primaryId: 'GRV-2026-1015',
    matches: [
      { id: 'GRV-2026-1034', score: 91, reason: 'Same category, ward, and school proximity keywords' },
      { id: 'GRV-2026-1047', score: 78, reason: 'Similar location and road damage near school' },
    ],
  },
  {
    primaryId: 'GRV-2026-1001',
    matches: [
      { id: 'GRV-2026-1006', score: 72, reason: 'Both water supply issues in Ward 7' },
      { id: 'GRV-2026-1055', score: 85, reason: 'Recurring water supply interruption in same ward' },
    ],
  },
  {
    primaryId: 'GRV-2026-1002',
    matches: [
      { id: 'GRV-2026-1045', score: 68, reason: 'Garbage collection failures in nearby areas' },
    ],
  },
];

export { AnalysisMethod, DuplicateMatchStatus, GrievanceStatus, NotificationType, Priority, SLARiskLevel };
