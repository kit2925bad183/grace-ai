import { Request, Response, NextFunction } from 'express';
import {
  getNotificationsForUser,
  getUnreadCount,
  markNotificationRead,
} from '../services/notificationService';
import { AppError } from '../middleware/errorHandler';

export async function listNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getNotificationsForUser(req.user!.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function unreadCount(req: Request, res: Response, next: NextFunction) {
  try {
    const count = await getUnreadCount(req.user!.id);
    res.json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
}

export async function markRead(req: Request, res: Response, next: NextFunction) {
  try {
    const updated = await markNotificationRead(req.params.id, req.user!.id);
    if (!updated) throw new AppError('Notification not found', 404);
    res.json({ success: true, data: { message: 'Notification marked as read' } });
  } catch (error) {
    next(error);
  }
}
