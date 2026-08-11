import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICitizenProfile extends Document {
  userId: Types.ObjectId;
  address?: string;
  wardId?: Types.ObjectId;
  pincode?: string;
  preferredLanguage: string;
  createdAt: Date;
  updatedAt: Date;
}

const citizenProfileSchema = new Schema<ICitizenProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
    },
    address: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    wardId: {
      type: Schema.Types.ObjectId,
      ref: 'Ward',
    },
    pincode: {
      type: String,
      trim: true,
      maxlength: 10,
    },
    preferredLanguage: {
      type: String,
      default: 'en',
      trim: true,
    },
  },
  { timestamps: true }
);

citizenProfileSchema.index({ userId: 1 }, { unique: true });
citizenProfileSchema.index({ wardId: 1 });

export const CitizenProfile = mongoose.model<ICitizenProfile>(
  'CitizenProfile',
  citizenProfileSchema
);
