import { Router } from 'express';
import * as subjectController from './subject.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { createSubjectSchema, updateSubjectSchema, subjectParamsSchema, assignFacultySchema } from './subject.validation';

export const subjectRoutes = Router();

subjectRoutes.use(authenticate);

subjectRoutes.get('/', subjectController.getAll);
subjectRoutes.get('/:id', validate({ params: subjectParamsSchema }), subjectController.getById);
subjectRoutes.post('/', authorize('admin'), validate({ body: createSubjectSchema }), subjectController.create);
subjectRoutes.put('/:id', authorize('admin'), validate({ params: subjectParamsSchema, body: updateSubjectSchema }), subjectController.update);
subjectRoutes.delete('/:id', authorize('admin'), validate({ params: subjectParamsSchema }), subjectController.remove);
subjectRoutes.post('/:id/faculty', authorize('admin'), validate({ params: subjectParamsSchema, body: assignFacultySchema }), subjectController.assignFaculty);
subjectRoutes.delete('/:id/faculty/:facultyId', authorize('admin'), validate({ params: subjectParamsSchema }), subjectController.removeFaculty);
