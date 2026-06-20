import { Router } from 'express';
import * as courseController from './course.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { createCourseSchema, updateCourseSchema, courseParamsSchema } from './course.validation';

export const courseRoutes = Router();

courseRoutes.use(authenticate);

courseRoutes.get('/', courseController.getAll);
courseRoutes.get('/:id', validate({ params: courseParamsSchema }), courseController.getById);
courseRoutes.post('/', authorize('admin'), validate({ body: createCourseSchema }), courseController.create);
courseRoutes.put('/:id', authorize('admin'), validate({ params: courseParamsSchema, body: updateCourseSchema }), courseController.update);
courseRoutes.delete('/:id', authorize('admin'), validate({ params: courseParamsSchema }), courseController.remove);
