import { Router } from 'express';
import * as authController from './auth.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { authLimiter } from '../../middleware/rateLimiter';
import { registerSchema, loginSchema, refreshSchema } from './auth.validation';

export const authRoutes = Router();

authRoutes.post('/register', authLimiter, authenticate, authorize('admin'), validate({ body: registerSchema }), authController.register);
authRoutes.post('/login', authLimiter, validate({ body: loginSchema }), authController.login);
authRoutes.post('/refresh', validate({ body: refreshSchema }), authController.refresh);
authRoutes.post('/logout', authenticate, authController.logout);
authRoutes.get('/me', authenticate, authController.getMe);
