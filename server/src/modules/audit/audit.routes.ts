import { Router } from 'express';
import * as auditController from './audit.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/rbac';

export const auditRoutes = Router();

auditRoutes.use(authenticate, authorize('admin'));

auditRoutes.get('/', auditController.listAuditLogs);
