import mongoose, { Document, Schema, Types } from 'mongoose';
import { SLARiskLevel } from './enums';

export interface ISLAPrediction extends Document {
  grievanceId: Types.ObjectId;
  slaDeadline: Date;
  predictedResolutionDate: Date;
  riskLevel: SLARiskLevel;
  riskPercentage: number;
  remainingHours: number;
  recommendation: string;
  createdAt: Date;
  updatedAt: Date;
}

const slaPredictionSchema = new Schema<ISLAPrediction>(
  {
    grievanceId: {
      type: Schema.Types.ObjectId,
      ref: 'Grievance',
      required: [true, 'Grievance ID is required'],
      unique: true,
    },
    slaDeadline: {
      type: Date,
      required: [true, 'SLA deadline is required'],
    },
    predictedResolutionDate: {
      type: Date,
      required: [true, 'Predicted resolution date is required'],
    },
    riskLevel: {
      type: String,
      enum: Object.values(SLARiskLevel),
      required: [true, 'Risk level is required'],
    },
    riskPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    remainingHours: {
      type: Number,
      required: true,
    },
    recommendation: {
      type: String,
      required: [true, 'Recommendation is required'],
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

slaPredictionSchema.index({ grievanceId: 1 }, { unique: true });
slaPredictionSchema.index({ riskLevel: 1 });
slaPredictionSchema.index({ riskPercentage: -1 });
slaPredictionSchema.index({ slaDeadline: 1 });

export const SLAPrediction = mongoose.model<ISLAPrediction>(
  'SLAPrediction',
  slaPredictionSchema
);
