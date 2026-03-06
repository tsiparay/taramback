import type { NextFunction, Request, Response } from 'express';

import { HttpError } from '../utils/httpError';

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) return next(err);

  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message, details: err.details });
  }

  console.error(err);
  return res.status(500).json({ message: 'internal_error' });
}
