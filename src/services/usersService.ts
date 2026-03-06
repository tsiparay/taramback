import { all, get, run } from '../utils/db';
import type { User, Role } from '../types/permissions';

type DbUserRow = {
  id: number;
  username: string;
  email: string;
  role: string;
  networkId: number;
};

function toUser(r: DbUserRow): User {
  return {
    id: r.id,
    username: r.username,
    email: r.email,
    role: r.role as Role,
    networkId: r.networkId,
  };
}

export async function listUsers(): Promise<User[]> {
  const rows = await all<DbUserRow>('SELECT id, username, email, role, networkId FROM users ORDER BY id ASC');
  return rows.map(toUser);
}

export async function getUserById(id: number): Promise<User | null> {
  const row = await get<DbUserRow>('SELECT id, username, email, role, networkId FROM users WHERE id = ? LIMIT 1', [id]);
  return row ? toUser(row) : null;
}

export type UpdateUserInput = {
  role?: Role;
  networkId?: number;
};

export async function updateUser(id: number, input: UpdateUserInput): Promise<User | null> {
  const existing = await getUserById(id);
  if (!existing) return null;

  const nextRole = input.role ?? existing.role;
  const nextNetworkId = input.networkId ?? existing.networkId;

  await run('UPDATE users SET role = ?, networkId = ? WHERE id = ?', [nextRole, nextNetworkId, id]);
  return getUserById(id);
}
