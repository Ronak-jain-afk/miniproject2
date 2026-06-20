import { Router } from 'express';
import * as sectionController from './section.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { createSectionSchema, updateSectionSchema, sectionParamsSchema } from './section.validation';

export const sectionRoutes = Router();

sectionRoutes.use(authenticate);

sectionRoutes.get('/', sectionController.getAll);
sectionRoutes.get('/:id', validate({ params: sectionParamsSchema }), sectionController.getById);
sectionRoutes.post('/', authorize('admin'), validate({ body: createSectionSchema }), sectionController.create);
sectionRoutes.put('/:id', authorize('admin'), validate({ params: sectionParamsSchema, body: updateSectionSchema }), sectionController.update);
sectionRoutes.delete('/:id', authorize('admin'), validate({ params: sectionParamsSchema }), sectionController.remove);
