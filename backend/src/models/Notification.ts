import mongoose, { Document, Schema, Types } from 'mongoose';
import { NotificationType } from './enums';

export interface INotification extends Document {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: 600,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: [true, 'Notification type is required'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ userId: 1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model<INotification>(
  'Notification',
  notificationSchema
);
