import { Types } from 'mongoose';
import { AuditLog } from '../models';
import type { Request } from 'express';

export interface AuditEntry {
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  req?: Request;
}

export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  try {
    await AuditLog.create({
      userId: entry.userId ? new Types.ObjectId(entry.userId) : undefined,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      oldValue: entry.oldValue,
      newValue: entry.newValue,
      ipAddress: entry.req?.ip,
      userAgent: entry.req?.get('user-agent')?.slice(0, 512),
    });
  } catch (error) {
    console.error('[audit] Failed to write audit log:', error);
  }
}
