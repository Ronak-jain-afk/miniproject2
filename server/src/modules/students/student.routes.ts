import { Router } from 'express';
import * as studentController from './student.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { createStudentSchema, updateStudentSchema, updateStudentStatusSchema, studentParamsSchema } from './student.validation';

export const studentRoutes = Router();

studentRoutes.use(authenticate);

studentRoutes.get('/', studentController.getAll);
studentRoutes.get('/:id', validate({ params: studentParamsSchema }), studentController.getById);
studentRoutes.post('/', authorize('admin'), validate({ body: createStudentSchema }), studentController.create);
studentRoutes.put('/:id', authorize('admin'), validate({ params: studentParamsSchema, body: updateStudentSchema }), studentController.update);
studentRoutes.patch('/:id/status', authorize('admin'), validate({ params: studentParamsSchema, body: updateStudentStatusSchema }), studentController.updateStatus);
