import { Router } from 'express';
import * as analyticsController from './analytics.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/rbac';

export const analyticsRoutes = Router();

analyticsRoutes.use(authenticate);

analyticsRoutes.get('/faculty/dashboard', authorize('faculty'), analyticsController.facultyDashboard);
analyticsRoutes.get('/student/dashboard', authorize('student'), analyticsController.studentDashboard);
analyticsRoutes.get('/admin/dashboard', authorize('admin'), analyticsController.adminDashboard);
analyticsRoutes.get('/low-attendance', authorize('admin', 'faculty'), analyticsController.lowAttendance);
analyticsRoutes.get('/attendance-trends', analyticsController.attendanceTrends);
analyticsRoutes.get('/department-wise', authorize('admin'), analyticsController.departmentWise);
