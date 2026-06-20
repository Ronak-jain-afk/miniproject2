import { Router } from 'express';
import * as ruleController from './rule.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { createRuleSchema, updateRuleSchema, ruleParamsSchema } from './rule.validation';

export const ruleRoutes = Router();

ruleRoutes.use(authenticate);

ruleRoutes.get('/', ruleController.getAll);
ruleRoutes.get('/:id', validate({ params: ruleParamsSchema }), ruleController.getById);
ruleRoutes.post('/', authorize('admin'), validate({ body: createRuleSchema }), ruleController.create);
ruleRoutes.put('/:id', authorize('admin'), validate({ params: ruleParamsSchema, body: updateRuleSchema }), ruleController.update);
ruleRoutes.delete('/:id', authorize('admin'), validate({ params: ruleParamsSchema }), ruleController.remove);
