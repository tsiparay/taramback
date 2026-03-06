import type { User } from './permissions';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
