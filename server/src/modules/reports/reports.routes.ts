import { Router } from 'express';
import * as reportsController from './reports.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { z } from 'zod';

export const reportRoutes = Router();

reportRoutes.use(authenticate);

reportRoutes.get('/student/:studentId', authorize('admin', 'faculty'), validate({ params: z.object({ studentId: z.string().regex(/^[a-f\d]{24}$/i) }) }), reportsController.studentReport);
reportRoutes.get('/subject/:subjectId', authorize('admin', 'faculty'), validate({ params: z.object({ subjectId: z.string().regex(/^[a-f\d]{24}$/i) }) }), reportsController.subjectReport);
reportRoutes.get('/defaulters', authorize('admin'), reportsController.defaultersReport);
