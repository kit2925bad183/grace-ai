import mongoose, { Document, Schema } from 'mongoose';

export interface IWard extends Document {
  name: string;
  code: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const wardSchema = new Schema<IWard>(
  {
    name: {
      type: String,
      required: [true, 'Ward name is required'],
      trim: true,
      maxlength: 100,
    },
    code: {
      type: String,
      required: [true, 'Ward code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 20,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
    },
  },
  { timestamps: true }
);

wardSchema.index({ code: 1 }, { unique: true });

export const Ward = mongoose.model<IWard>('Ward', wardSchema);
