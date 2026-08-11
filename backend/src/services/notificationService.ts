import { Types } from 'mongoose';
import { Notification } from '../models/Notification';
import { NotificationType } from '../models/enums';

export async function createNotification(params: {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  session?: import('mongoose').ClientSession;
}): Promise<void> {
  await Notification.create(
    [
      {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type,
        isRead: false,
      },
    ],
    { session: params.session }
  );
}

export async function getNotificationsForUser(userId: string) {
  return Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
}

export async function getUnreadCount(userId: string): Promise<number> {
  return Notification.countDocuments({ userId, isRead: false });
}

export async function markNotificationRead(
  notificationId: string,
  userId: string
): Promise<boolean> {
  const result = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );
  return !!result;
}
