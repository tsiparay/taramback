import { NextFunction, Request, Response } from 'express';

import { Role } from '../types/permissions';

export function requireRole(roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Placeholder: later extract user from auth token/session
    const role = (req.header('x-role') as Role | undefined) ?? Role.USER;

    if (!roles.includes(role)) {
      return res.status(403).json({ message: 'forbidden' });
    }

    return next();
  };
}
