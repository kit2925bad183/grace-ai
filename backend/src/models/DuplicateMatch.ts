import mongoose, { Document, Schema, Types } from 'mongoose';
import { DuplicateMatchStatus } from './enums';

export interface IDuplicateMatch extends Document {
  grievanceId: Types.ObjectId;
  matchedGrievanceId: Types.ObjectId;
  similarityScore: number;
  reason: string;
  status: DuplicateMatchStatus;
  createdAt: Date;
  updatedAt: Date;
}

const duplicateMatchSchema = new Schema<IDuplicateMatch>(
  {
    grievanceId: {
      type: Schema.Types.ObjectId,
      ref: 'Grievance',
      required: [true, 'Grievance ID is required'],
    },
    matchedGrievanceId: {
      type: Schema.Types.ObjectId,
      ref: 'Grievance',
      required: [true, 'Matched grievance ID is required'],
    },
    similarityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
      maxlength: 400,
    },
    status: {
      type: String,
      enum: Object.values(DuplicateMatchStatus),
      default: DuplicateMatchStatus.POTENTIAL,
    },
  },
  { timestamps: true }
);

duplicateMatchSchema.index({ grievanceId: 1 });
duplicateMatchSchema.index({ matchedGrievanceId: 1 });
duplicateMatchSchema.index({ grievanceId: 1, matchedGrievanceId: 1 });
duplicateMatchSchema.index({ status: 1 });
duplicateMatchSchema.index({ similarityScore: -1 });

export const DuplicateMatch = mongoose.model<IDuplicateMatch>(
  'DuplicateMatch',
  duplicateMatchSchema
);
