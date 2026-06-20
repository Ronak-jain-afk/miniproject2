import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { logger } from '../config/logger';

export interface AuthPayload {
  userId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Access denied. No token provided.' });
    return;
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Invalid access token');
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}
