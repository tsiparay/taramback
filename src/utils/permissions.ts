import { NextFunction, Request, Response } from 'express';

import { Role } from '../types/permissions';
import { getCurrentUser } from './auth';

export function requireRole(roles: Role[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = await getCurrentUser(req);
    (req as any).user = user;

    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: 'forbidden' });
    }

    return next();
  };
}
