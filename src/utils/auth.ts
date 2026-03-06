import type { Request } from 'express';

import { get } from './db';
import type { User } from '../types/permissions';

type DbUserRow = {
  id: number;
  username: string;
  email: string;
  role: string;
  networkId: number;
};

export async function getCurrentUser(req: Request): Promise<User> {
  const userIdRaw = req.header('x-user-id');
  const userId = userIdRaw ? Number(userIdRaw) : NaN;

  if (!Number.isFinite(userId)) {
    // Default to admin user 1 for local/dev.
    const fallback = await get<DbUserRow>('SELECT id, username, email, role, networkId FROM users WHERE id = 1 LIMIT 1');
    if (fallback) {
      return {
        id: fallback.id,
        username: fallback.username,
        email: fallback.email,
        role: fallback.role as any,
        networkId: fallback.networkId,
      };
    }

    return { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin' as any, networkId: 1 };
  }

  const row = await get<DbUserRow>('SELECT id, username, email, role, networkId FROM users WHERE id = ? LIMIT 1', [userId]);
  if (!row) {
    return { id: userId, username: `user${userId}`, email: `user${userId}@example.com`, role: 'user' as any, networkId: 1 };
  }

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    role: row.role as any,
    networkId: row.networkId,
  };
}
