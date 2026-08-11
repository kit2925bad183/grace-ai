import mongoose, { Document, Schema, Types } from 'mongoose';
import { AnalysisMethod, Priority, SLARiskLevel } from './enums';

export interface IAIAnalysis extends Document {
  grievanceId: Types.ObjectId;
  category: string;
  department: string;
  priority: Priority;
  duplicateProbability: number;
  slaRisk: SLARiskLevel;
  estimatedResolutionDays: number;
  confidence: number;
  detectedKeywords: string[];
  recommendation: string;
  analysisMethod: AnalysisMethod;
  createdAt: Date;
  updatedAt: Date;
}

const aiAnalysisSchema = new Schema<IAIAnalysis>(
  {
    grievanceId: {
      type: Schema.Types.ObjectId,
      ref: 'Grievance',
      required: [true, 'Grievance ID is required'],
      unique: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    priority: {
      type: String,
      enum: Object.values(Priority),
      required: [true, 'Priority is required'],
    },
    duplicateProbability: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    slaRisk: {
      type: String,
      enum: Object.values(SLARiskLevel),
      required: [true, 'SLA risk is required'],
    },
    estimatedResolutionDays: {
      type: Number,
      required: true,
      min: 1,
      max: 90,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    detectedKeywords: [
      {
        type: String,
        trim: true,
      },
    ],
    recommendation: {
      type: String,
      required: [true, 'Recommendation is required'],
      trim: true,
      maxlength: 500,
    },
    analysisMethod: {
      type: String,
      enum: Object.values(AnalysisMethod),
      default: AnalysisMethod.RULE_BASED_DEMO,
    },
  },
  { timestamps: true }
);

aiAnalysisSchema.index({ grievanceId: 1 }, { unique: true });
aiAnalysisSchema.index({ category: 1 });
aiAnalysisSchema.index({ priority: 1 });
aiAnalysisSchema.index({ slaRisk: 1 });

export const AIAnalysis = mongoose.model<IAIAnalysis>('AIAnalysis', aiAnalysisSchema);
