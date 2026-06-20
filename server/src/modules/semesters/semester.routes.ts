import { Router } from 'express';
import * as semesterController from './semester.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { createSemesterSchema, updateSemesterSchema, semesterParamsSchema } from './semester.validation';

export const semesterRoutes = Router();

semesterRoutes.use(authenticate);

semesterRoutes.get('/', semesterController.getAll);
semesterRoutes.get('/:id', validate({ params: semesterParamsSchema }), semesterController.getById);
semesterRoutes.post('/', authorize('admin'), validate({ body: createSemesterSchema }), semesterController.create);
semesterRoutes.put('/:id', authorize('admin'), validate({ params: semesterParamsSchema, body: updateSemesterSchema }), semesterController.update);
semesterRoutes.delete('/:id', authorize('admin'), validate({ params: semesterParamsSchema }), semesterController.remove);
