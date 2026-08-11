import mongoose, { Document, Schema, Types } from 'mongoose';
import { GrievanceStatus } from './enums';

export interface IGrievanceStatusHistory extends Document {
  grievanceId: Types.ObjectId;
  oldStatus?: GrievanceStatus;
  newStatus: GrievanceStatus;
  changedBy: Types.ObjectId;
  comment?: string;
  createdAt: Date;
}

const grievanceStatusHistorySchema = new Schema<IGrievanceStatusHistory>(
  {
    grievanceId: {
      type: Schema.Types.ObjectId,
      ref: 'Grievance',
      required: [true, 'Grievance ID is required'],
    },
    oldStatus: {
      type: String,
      enum: Object.values(GrievanceStatus),
    },
    newStatus: {
      type: String,
      enum: Object.values(GrievanceStatus),
      required: [true, 'New status is required'],
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Changed by user is required'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

grievanceStatusHistorySchema.index({ grievanceId: 1, createdAt: 1 });
grievanceStatusHistorySchema.index({ changedBy: 1 });

export const GrievanceStatusHistory = mongoose.model<IGrievanceStatusHistory>(
  'GrievanceStatusHistory',
  grievanceStatusHistorySchema
);
