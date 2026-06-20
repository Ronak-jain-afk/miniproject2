import { Request, Response } from 'express';
import * as notificationService from './notification.service';

export async function listNotifications(req: Request, res: Response) {
  const userId = (req as any).user.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await notificationService.getUserNotifications(userId, page, limit);
  res.json(result);
}

export async function markRead(req: Request, res: Response) {
  const userId = (req as any).user.id;
  const notification = await notificationService.markAsRead(req.params.id, userId);
  if (!notification) return res.status(404).json({ error: 'Notification not found' });
  res.json(notification);
}

export async function markAllRead(req: Request, res: Response) {
  const userId = (req as any).user.id;
  await notificationService.markAllAsRead(userId);
  res.json({ message: 'All notifications marked as read' });
}

export async function unreadCount(req: Request, res: Response) {
  const userId = (req as any).user.id;
  const count = await notificationService.getUnreadCount(userId);
  res.json({ count });
}
