import mongoose, { Document, Schema } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  code: string;
  description?: string;
  contactEmail?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
      maxlength: 200,
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 20,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

departmentSchema.index({ code: 1 }, { unique: true });
departmentSchema.index({ active: 1 });

export const Department = mongoose.model<IDepartment>('Department', departmentSchema);
