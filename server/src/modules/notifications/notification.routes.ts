import { Router } from 'express';
import * as notificationController from './notification.controller';
import { authenticate } from '../../middleware/authenticate';

export const notificationRoutes = Router();

notificationRoutes.use(authenticate);

notificationRoutes.get('/', notificationController.listNotifications);
notificationRoutes.get('/unread-count', notificationController.unreadCount);
notificationRoutes.patch('/:id/read', notificationController.markRead);
notificationRoutes.patch('/read-all', notificationController.markAllRead);
