import mongoose from 'mongoose';
import { PlatformSettings, IPlatformSettings } from '../models/PlatformSettings';
import { writeAuditLog } from './auditService';
import type { Request } from 'express';

const SETTINGS_ID = 'platform';

async function ensureSettings(): Promise<IPlatformSettings> {
  let settings = await PlatformSettings.findOne();
  if (!settings) {
    settings = await PlatformSettings.create({});
  }
  return settings;
}

export async function getPlatformSettings() {
  const settings = await ensureSettings();
  return settings.toObject();
}

export async function updatePlatformSettings(
  updates: Partial<{
    platformName: string;
    supportEmail: string;
    registrationEnabled: boolean;
    googleLoginEnabled: boolean;
    maintenanceMode: boolean;
    maintenanceMessage: string;
    aiAnalysisEnabled: boolean;
    duplicateDetectionEnabled: boolean;
    forecastingEnabled: boolean;
    complaintSubmissionEnabled: boolean;
  }>,
  adminId: string,
  req?: Request
) {
  const settings = await ensureSettings();
  const oldValue = settings.toObject();

  Object.assign(settings, updates);
  settings.updatedBy = new mongoose.Types.ObjectId(adminId);
  await settings.save();

  await writeAuditLog({
    userId: adminId,
    action: 'ADMIN_UPDATED_SETTINGS',
    resourceType: 'PlatformSettings',
    resourceId: SETTINGS_ID,
    oldValue: oldValue as unknown as Record<string, unknown>,
    newValue: settings.toObject() as unknown as Record<string, unknown>,
    req,
  });

  return settings.toObject();
}

export async function isMaintenanceMode(): Promise<boolean> {
  const settings = await PlatformSettings.findOne().select('maintenanceMode').lean();
  return settings?.maintenanceMode ?? false;
}

export async function isRegistrationEnabled(): Promise<boolean> {
  const settings = await PlatformSettings.findOne().select('registrationEnabled').lean();
  return settings?.registrationEnabled ?? true;
}
