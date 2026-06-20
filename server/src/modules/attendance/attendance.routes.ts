import { Router } from 'express';
import * as attendanceController from './attendance.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { createSessionSchema, updateRecordsSchema, sessionParamsSchema } from './attendance.validation';

export const attendanceRoutes = Router();

attendanceRoutes.use(authenticate);

attendanceRoutes.post('/sessions', validate({ body: createSessionSchema }), attendanceController.createSession);
attendanceRoutes.get('/sessions', attendanceController.getSessions);
attendanceRoutes.get('/sessions/:id', validate({ params: sessionParamsSchema }), attendanceController.getSessionDetail);
attendanceRoutes.put('/sessions/:id/records', validate({ params: sessionParamsSchema, body: updateRecordsSchema }), attendanceController.updateRecords);
attendanceRoutes.get('/students/:studentId', validate({ params: sessionParamsSchema }), attendanceController.getStudentRecords);
attendanceRoutes.get('/summary/student/:studentId', validate({ params: sessionParamsSchema }), attendanceController.getStudentSummary);
