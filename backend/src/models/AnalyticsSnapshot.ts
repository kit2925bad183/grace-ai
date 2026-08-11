import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalyticsSnapshot extends Document {
  snapshotDate: Date;
  totalGrievances: number;
  resolvedGrievances: number;
  inProgressGrievances: number;
  slaComplianceRate: number;
  avgResolutionDays: number;
  slaAtRiskCount: number;
  duplicateCount: number;
  grievancesByStatus: Record<string, number>;
  grievancesByPriority: Record<string, number>;
  grievancesByDepartment: Record<string, number>;
  grievancesByCategory: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

const analyticsSnapshotSchema = new Schema<IAnalyticsSnapshot>(
  {
    snapshotDate: {
      type: Date,
      required: [true, 'Snapshot date is required'],
    },
    totalGrievances: {
      type: Number,
      required: true,
      min: 0,
    },
    resolvedGrievances: {
      type: Number,
      required: true,
      min: 0,
    },
    inProgressGrievances: {
      type: Number,
      required: true,
      min: 0,
    },
    slaComplianceRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    avgResolutionDays: {
      type: Number,
      required: true,
      min: 0,
    },
    slaAtRiskCount: {
      type: Number,
      required: true,
      min: 0,
    },
    duplicateCount: {
      type: Number,
      required: true,
      min: 0,
    },
    grievancesByStatus: {
      type: Map,
      of: Number,
      default: {},
    },
    grievancesByPriority: {
      type: Map,
      of: Number,
      default: {},
    },
    grievancesByDepartment: {
      type: Map,
      of: Number,
      default: {},
    },
    grievancesByCategory: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

analyticsSnapshotSchema.index({ snapshotDate: -1 });

export const AnalyticsSnapshot = mongoose.model<IAnalyticsSnapshot>(
  'AnalyticsSnapshot',
  analyticsSnapshotSchema
);
