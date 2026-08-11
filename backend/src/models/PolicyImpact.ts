import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPolicyImpact extends Document {
  policyName: string;
  description: string;
  departmentId: Types.ObjectId;
  categoryId?: Types.ObjectId;
  beforeComplaintsPerMonth: number;
  afterComplaintsPerMonth: number;
  impactPercentage: number;
  slaBefore: number;
  slaAfter: number;
  effectiveDate: Date;
  isDemoSeed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const policyImpactSchema = new Schema<IPolicyImpact>(
  {
    policyName: {
      type: String,
      required: [true, 'Policy name is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 600,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'ComplaintCategory',
    },
    beforeComplaintsPerMonth: {
      type: Number,
      required: true,
      min: 0,
    },
    afterComplaintsPerMonth: {
      type: Number,
      required: true,
      min: 0,
    },
    impactPercentage: {
      type: Number,
      required: true,
    },
    slaBefore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    slaAfter: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    effectiveDate: {
      type: Date,
      required: [true, 'Effective date is required'],
    },
    isDemoSeed: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

policyImpactSchema.index({ departmentId: 1 });
policyImpactSchema.index({ effectiveDate: -1 });
policyImpactSchema.index({ isDemoSeed: 1 });

export const PolicyImpact = mongoose.model<IPolicyImpact>(
  'PolicyImpact',
  policyImpactSchema
);
