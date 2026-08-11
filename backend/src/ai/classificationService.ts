import { Priority, SLARiskLevel } from '../models/enums';

export interface ClassificationResult {
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

const RULES: Array<{
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

export function classifyComplaint(
  title: string,
  description: string,
  selectedPriority?: Priority
): ClassificationResult {
  const text = `${title} ${description}`.toLowerCase();

  for (const rule of RULES) {
    const matched = rule.keywords.filter((kw) => text.includes(kw));
    if (matched.length > 0) {
      const isSchoolPothole =
        text.includes('pothole') &&
        text.includes('school') &&
        (text.includes('vehicle') || text.includes('damage'));

      const priority = selectedPriority ?? (isSchoolPothole ? Priority.HIGH : rule.priority);

      return {
        category: rule.category,
        department: rule.department,
        priority,
        duplicateProbability: isSchoolPothole ? 12 : 15,
        slaRisk: isSchoolPothole ? SLARiskLevel.LOW : SLARiskLevel.MEDIUM,
        estimatedResolutionDays: isSchoolPothole ? 4 : priority === Priority.CRITICAL ? 2 : 5,
        confidence: isSchoolPothole ? 94 : 85,
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
    priority: selectedPriority ?? Priority.MEDIUM,
    duplicateProbability: 8,
    slaRisk: SLARiskLevel.LOW,
    estimatedResolutionDays: 7,
    confidence: 75,
    detectedKeywords: [],
    recommendation: 'Route to appropriate department for manual review.',
  };
}
