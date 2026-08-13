import mongoose, { Document, Schema, Types } from 'mongoose';
import { GrievanceStatus, Priority } from './enums';

export interface IGrievance extends Document {
  grievanceId: string;
  citizenId: Types.ObjectId;
  title: string;
  description: string;
  categoryId: Types.ObjectId;
  departmentId: Types.ObjectId;
  wardId: Types.ObjectId;
  location: string;
  priority: Priority;
  status: GrievanceStatus;
  assignedOfficerId?: Types.ObjectId;
  slaDeadline: Date;
  resolvedAt?: Date;
  mergedIntoGrievanceId?: Types.ObjectId;
  feedbackRating?: number;
  feedbackComment?: string;
  feedbackAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const grievanceSchema = new Schema<IGrievance>(
  {
    grievanceId: {
      type: String,
      required: [true, 'Grievance ID is required'],
      unique: true,
      trim: true,
      match: [/^GRV-\d{4}-\d{4}$/, 'Invalid grievance ID format (GRV-YYYY-XXXX)'],
    },
    citizenId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Citizen ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 3000,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'ComplaintCategory',
      required: [true, 'Category is required'],
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    wardId: {
      type: Schema.Types.ObjectId,
      ref: 'Ward',
      required: [true, 'Ward is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: 300,
    },
    priority: {
      type: String,
      enum: Object.values(Priority),
      required: [true, 'Priority is required'],
    },
    status: {
      type: String,
      enum: Object.values(GrievanceStatus),
      default: GrievanceStatus.SUBMITTED,
    },
    assignedOfficerId: {
      type: Schema.Types.ObjectId,
      ref: 'Officer',
    },
    slaDeadline: {
      type: Date,
      required: [true, 'SLA deadline is required'],
    },
    resolvedAt: {
      type: Date,
    },
    mergedIntoGrievanceId: {
      type: Schema.Types.ObjectId,
      ref: 'Grievance',
    },
    feedbackRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedbackComment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    feedbackAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

grievanceSchema.index({ grievanceId: 1 }, { unique: true });
grievanceSchema.index({ citizenId: 1 });
grievanceSchema.index({ departmentId: 1 });
grievanceSchema.index({ categoryId: 1 });
grievanceSchema.index({ wardId: 1 });
grievanceSchema.index({ status: 1 });
grievanceSchema.index({ priority: 1 });
grievanceSchema.index({ createdAt: -1 });
grievanceSchema.index({ slaDeadline: 1 });
grievanceSchema.index({ assignedOfficerId: 1 });
grievanceSchema.index({ departmentId: 1, status: 1 });
grievanceSchema.index({ wardId: 1, categoryId: 1 });

export const Grievance = mongoose.model<IGrievance>('Grievance', grievanceSchema);
