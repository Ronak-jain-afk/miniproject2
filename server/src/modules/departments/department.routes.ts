import { Router } from 'express';
import * as departmentController from './department.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { createDepartmentSchema, updateDepartmentSchema, departmentParamsSchema } from './department.validation';

export const departmentRoutes = Router();

departmentRoutes.use(authenticate);

departmentRoutes.get('/', departmentController.getAll);
departmentRoutes.get('/:id', validate({ params: departmentParamsSchema }), departmentController.getById);
departmentRoutes.post('/', authorize('admin'), validate({ body: createDepartmentSchema }), departmentController.create);
departmentRoutes.put('/:id', authorize('admin'), validate({ params: departmentParamsSchema, body: updateDepartmentSchema }), departmentController.update);
departmentRoutes.delete('/:id', authorize('admin'), validate({ params: departmentParamsSchema }), departmentController.remove);
