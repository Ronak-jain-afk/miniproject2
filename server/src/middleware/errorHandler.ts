import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    logger.warn({ err }, 'Operational error');
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  logger.error({ err }, 'Unexpected error');
  res.status(500).json({ error: 'Internal server error.' });
}
