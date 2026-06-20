import { Router } from 'express';
import * as facultyController from './faculty.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { createFacultySchema, updateFacultySchema, facultyParamsSchema } from './faculty.validation';

export const facultyRoutes = Router();

facultyRoutes.use(authenticate);

facultyRoutes.get('/', facultyController.getAll);
facultyRoutes.get('/:id', validate({ params: facultyParamsSchema }), facultyController.getById);
facultyRoutes.post('/', authorize('admin'), validate({ body: createFacultySchema }), facultyController.create);
facultyRoutes.put('/:id', authorize('admin'), validate({ params: facultyParamsSchema, body: updateFacultySchema }), facultyController.update);
facultyRoutes.get('/:id/subjects', validate({ params: facultyParamsSchema }), facultyController.getAssignedSubjects);
facultyRoutes.get('/:id/workload', authorize('admin'), validate({ params: facultyParamsSchema }), facultyController.getWorkload);
