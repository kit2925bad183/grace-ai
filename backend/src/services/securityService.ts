import { Types } from 'mongoose';
import { SecurityEvent, SecurityEventType, SecuritySeverity } from '../models/SecurityEvent';
import type { Request } from 'express';

export interface SecurityEventInput {
  userId?: string;
  eventType: SecurityEventType;
  severity?: SecuritySeverity;
  metadata?: Record<string, unknown>;
  req?: Request;
}

export async function writeSecurityEvent(input: SecurityEventInput): Promise<void> {
  try {
    await SecurityEvent.create({
      userId: input.userId ? new Types.ObjectId(input.userId) : undefined,
      eventType: input.eventType,
      severity: input.severity ?? severityForEvent(input.eventType),
      metadata: input.metadata,
      ipAddress: input.req?.ip,
      userAgent: input.req?.get('user-agent')?.slice(0, 512),
    });
  } catch (error) {
    console.error('[security] Failed to write security event:', error);
  }
}

function severityForEvent(eventType: SecurityEventType): SecuritySeverity {
  switch (eventType) {
    case 'LOGIN_FAILURE':
    case 'ACCOUNT_LOCKED':
    case 'SUSPICIOUS_ACTIVITY':
      return 'MEDIUM';
    case 'SESSION_REVOKED':
    case 'ROLE_CHANGED':
    case 'ADMIN_ACTION':
      return 'HIGH';
    default:
      return 'LOW';
  }
}

export async function listSecurityEvents(filters: {
  eventType?: string;
  userId?: string;
  severity?: string;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 30));
  const skip = (page - 1) * limit;
  const query: Record<string, unknown> = {};

  if (filters.eventType) query.eventType = filters.eventType;
  if (filters.userId) query.userId = filters.userId;
  if (filters.severity) query.severity = filters.severity;

  const [items, total] = await Promise.all([
    SecurityEvent.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    SecurityEvent.countDocuments(query),
  ]);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

export async function getSecurityDashboardStats() {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [failedLogins, successfulLogins, lockedAccounts, recentEvents, suspicious] =
    await Promise.all([
      SecurityEvent.countDocuments({ eventType: 'LOGIN_FAILURE', createdAt: { $gte: since24h } }),
      SecurityEvent.countDocuments({ eventType: 'LOGIN_SUCCESS', createdAt: { $gte: since24h } }),
      SecurityEvent.countDocuments({ eventType: 'ACCOUNT_LOCKED', createdAt: { $gte: since24h } }),
      SecurityEvent.find().sort({ createdAt: -1 }).limit(10).populate('userId', 'name email').lean(),
      SecurityEvent.countDocuments({
        eventType: { $in: ['SUSPICIOUS_ACTIVITY', 'SESSION_REVOKED'] },
        createdAt: { $gte: since24h },
      }),
    ]);

  return { failedLogins, successfulLogins, lockedAccounts, suspicious, recentEvents };
}
