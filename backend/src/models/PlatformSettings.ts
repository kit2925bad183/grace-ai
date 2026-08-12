import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPlatformSettings extends Document {
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
  updatedBy?: Types.ObjectId;
  updatedAt: Date;
}

const platformSettingsSchema = new Schema<IPlatformSettings>(
  {
    platformName: { type: String, default: 'GRACE AI', maxlength: 120 },
    supportEmail: { type: String, default: 'support@grace.ai', maxlength: 200 },
    registrationEnabled: { type: Boolean, default: true },
    googleLoginEnabled: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: {
      type: String,
      default: 'GRACE AI is temporarily under maintenance. Please try again later.',
      maxlength: 500,
    },
    aiAnalysisEnabled: { type: Boolean, default: true },
    duplicateDetectionEnabled: { type: Boolean, default: true },
    forecastingEnabled: { type: Boolean, default: true },
    complaintSubmissionEnabled: { type: Boolean, default: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const PlatformSettings = mongoose.model<IPlatformSettings>(
  'PlatformSettings',
  platformSettingsSchema
);
