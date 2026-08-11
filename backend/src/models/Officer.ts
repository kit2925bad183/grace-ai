import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IOfficer extends Document {
  userId: Types.ObjectId;
  departmentId: Types.ObjectId;
  employeeCode: string;
  designation: string;
  wardIds: Types.ObjectId[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const officerSchema = new Schema<IOfficer>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department ID is required'],
    },
    employeeCode: {
      type: String,
      required: [true, 'Employee code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
      maxlength: 120,
    },
    wardIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Ward',
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

officerSchema.index({ userId: 1 }, { unique: true });
officerSchema.index({ employeeCode: 1 }, { unique: true });
officerSchema.index({ departmentId: 1 });
officerSchema.index({ wardIds: 1 });
officerSchema.index({ active: 1 });

export const Officer = mongoose.model<IOfficer>('Officer', officerSchema);
