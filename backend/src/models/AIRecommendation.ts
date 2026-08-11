import mongoose, { Document, Schema, Types } from 'mongoose';
import { AnalysisMethod, Priority } from './enums';

export interface IAIRecommendation extends Document {
  title: string;
  categoryId?: Types.ObjectId;
  wardId?: Types.ObjectId;
  departmentId?: Types.ObjectId;
  recommendation: string;
  description?: string;
  evidence?: string;
  priority: Priority;
  source: AnalysisMethod;
  insightLabel: string;
  isActive: boolean;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const aiRecommendationSchema = new Schema<IAIRecommendation>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'ComplaintCategory',
    },
    wardId: {
      type: Schema.Types.ObjectId,
      ref: 'Ward',
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
    recommendation: {
      type: String,
      required: [true, 'Recommendation is required'],
      trim: true,
      maxlength: 600,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 400,
    },
    evidence: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    priority: {
      type: String,
      enum: Object.values(Priority),
      default: Priority.MEDIUM,
    },
    source: {
      type: String,
      enum: Object.values(AnalysisMethod),
      default: AnalysisMethod.RULE_BASED_DEMO,
    },
    insightLabel: {
      type: String,
      default: 'AI-Generated Demo Insight',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

aiRecommendationSchema.index({ categoryId: 1 });
aiRecommendationSchema.index({ wardId: 1 });
aiRecommendationSchema.index({ departmentId: 1 });
aiRecommendationSchema.index({ isActive: 1 });
aiRecommendationSchema.index({ generatedAt: -1 });

export const AIRecommendation = mongoose.model<IAIRecommendation>(
  'AIRecommendation',
  aiRecommendationSchema
);
