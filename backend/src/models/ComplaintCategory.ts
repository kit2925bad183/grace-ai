import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IComplaintCategory extends Document {
  name: string;
  description?: string;
  defaultDepartmentId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const complaintCategorySchema = new Schema<IComplaintCategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 400,
    },
    defaultDepartmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Default department is required'],
    },
  },
  { timestamps: true }
);

complaintCategorySchema.index({ name: 1 }, { unique: true });
complaintCategorySchema.index({ defaultDepartmentId: 1 });

export const ComplaintCategory = mongoose.model<IComplaintCategory>(
  'ComplaintCategory',
  complaintCategorySchema
);
