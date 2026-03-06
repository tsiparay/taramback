import type { Request, Response } from 'express';

import { Role } from '../types/permissions';
import { getUserById, listUsers, updateUser } from '../services/usersService';

function parseId(req: Request): number | null {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return null;
  return id;
}

export async function list(req: Request, res: Response) {
  const users = await listUsers();
  return res.json(users);
}

export async function getById(req: Request, res: Response) {
  const id = parseId(req);
  if (id === null) return res.status(400).json({ message: 'invalid_id' });

  const user = await getUserById(id);
  if (!user) return res.status(404).json({ message: 'not_found' });

  return res.json(user);
}

export async function update(req: Request, res: Response) {
  const id = parseId(req);
  if (id === null) return res.status(400).json({ message: 'invalid_id' });

  const body = (req.body ?? {}) as { role?: unknown; networkId?: unknown };

  const next: { role?: Role; networkId?: number } = {};
  if (body.role !== undefined) {
    if (body.role !== Role.ADMIN && body.role !== Role.EDITOR && body.role !== Role.USER) {
      return res.status(400).json({ message: 'validation_error', details: [{ field: 'role', message: 'invalid' }] });
    }
    next.role = body.role;
  }

  if (body.networkId !== undefined) {
    const n = Number(body.networkId);
    if (!Number.isFinite(n)) {
      return res.status(400).json({ message: 'validation_error', details: [{ field: 'networkId', message: 'invalid' }] });
    }
    next.networkId = n;
  }

  const updated = await updateUser(id, next);
  if (!updated) return res.status(404).json({ message: 'not_found' });

  return res.json(updated);
}
