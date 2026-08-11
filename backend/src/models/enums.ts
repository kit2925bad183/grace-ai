export enum UserRole {
  CITIZEN = 'CITIZEN',
  AUTHORITY = 'AUTHORITY',
  OFFICER = 'OFFICER',
  ADMIN = 'ADMIN',
}

export enum GrievanceStatus {
  SUBMITTED = 'SUBMITTED',
  AI_ANALYZED = 'AI_ANALYZED',
  ASSIGNED = 'ASSIGNED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  IN_PROGRESS = 'IN_PROGRESS',
  ESCALATED = 'ESCALATED',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum SLARiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum DuplicateMatchStatus {
  POTENTIAL = 'POTENTIAL',
  CONFIRMED = 'CONFIRMED',
  DISMISSED = 'DISMISSED',
  MERGED = 'MERGED',
}

export enum NotificationType {
  STATUS_UPDATE = 'STATUS_UPDATE',
  ASSIGNMENT = 'ASSIGNMENT',
  SLA_ALERT = 'SLA_ALERT',
  RESOLUTION = 'RESOLUTION',
  SYSTEM = 'SYSTEM',
  DUPLICATE = 'DUPLICATE',
}

export enum AnalysisMethod {
  RULE_BASED_DEMO = 'RULE_BASED_DEMO',
}

export const COLLECTION_NAMES = [
  'users',
  'citizenprofiles',
  'departments',
  'officers',
  'complaintcategories',
  'wards',
  'grievances',
  'grievancestatushistories',
  'aianalyses',
  'slapredictions',
  'duplicatematches',
  'notifications',
  'analyticssnapshots',
  'policyimpacts',
  'airecommendations',
] as const;
