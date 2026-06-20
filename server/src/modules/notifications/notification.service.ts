import { Notification } from './notification.model';

export async function createNotification(params: {
  recipient: string;
  type: 'low_attendance' | 'session_reminder' | 'attendance_marked' | 'threshold_alert' | 'info';
  title: string;
  message: string;
  link?: string;
}) {
  return Notification.create(params);
}

export async function createBulkNotifications(
  recipients: string[],
  params: { type: INotificationType; title: string; message: string; link?: string }
) {
  const docs = recipients.map((recipient) => ({ ...params, recipient }));
  return Notification.insertMany(docs);
}

type INotificationType = 'low_attendance' | 'session_reminder' | 'attendance_marked' | 'threshold_alert' | 'info';

export async function getUserNotifications(userId: string, page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [data, total, unreadCount] = await Promise.all([
    Notification.find({ recipient: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments({ recipient: userId }),
    Notification.countDocuments({ recipient: userId, read: false }),
  ]);
  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    unreadCount,
  };
}

export async function markAsRead(notificationId: string, userId: string) {
  return Notification.findOneAndUpdate({ _id: notificationId, recipient: userId }, { read: true }, { new: true });
}

export async function markAllAsRead(userId: string) {
  return Notification.updateMany({ recipient: userId, read: false }, { read: true });
}

export async function getUnreadCount(userId: string) {
  return Notification.countDocuments({ recipient: userId, read: false });
}
