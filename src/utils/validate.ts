import { NextFunction, Request, Response } from 'express';

export function validateRequest(req: Request, res: Response, next: NextFunction) {
  // Placeholder for request validation (body/params/query)
  return next();
}
