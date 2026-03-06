import type { Request, Response } from 'express';

import { validateCreateCategory, validateUpdateCategory } from '../utils/categoriesValidation';
import { createCategory, deleteCategory, getCategoryById, listCategories, updateCategory } from '../services/categoriesService';
import { Role } from '../types/permissions';

export async function list(req: Request, res: Response) {
  const currentUser = (req as any).user as { role: string; networkId: number } | undefined;
  const items = await listCategories();

  if (currentUser && currentUser.role !== Role.ADMIN) {
    return res.json(items.filter((c) => c.networkId === currentUser.networkId));
  }

  return res.json(items);
}

export async function getById(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: 'invalid_id' });
  }

  const item = await getCategoryById(id);
  if (!item) return res.status(404).json({ message: 'not_found' });

  const currentUser = (req as any).user as { role: string; networkId: number } | undefined;
  if (currentUser && currentUser.role !== Role.ADMIN && item.networkId !== currentUser.networkId) {
    return res.status(403).json({ message: 'forbidden' });
  }

  return res.json(item);
}

export async function create(req: Request, res: Response) {
  const currentUser = (req as any).user as { role: string; networkId: number } | undefined;
  const v = validateCreateCategory(req.body ?? {});
  if (!v.ok) return res.status(400).json({ message: 'validation_error', details: v.errors });

  if (currentUser && currentUser.role !== Role.ADMIN && v.data.networkId !== currentUser.networkId) {
    return res.status(403).json({ message: 'forbidden' });
  }

  const created = await createCategory(v.data);
  return res.status(201).json(created);
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: 'invalid_id' });
  }

  const v = validateUpdateCategory(req.body ?? {});
  if (!v.ok) return res.status(400).json({ message: 'validation_error', details: v.errors });

  const currentUser = (req as any).user as { role: string; networkId: number } | undefined;
  const existing = await getCategoryById(id);
  if (!existing) return res.status(404).json({ message: 'not_found' });

  if (currentUser && currentUser.role !== Role.ADMIN && existing.networkId !== currentUser.networkId) {
    return res.status(403).json({ message: 'forbidden' });
  }

  if (currentUser && currentUser.role !== Role.ADMIN && v.data.networkId !== undefined && v.data.networkId !== currentUser.networkId) {
    return res.status(403).json({ message: 'forbidden' });
  }

  const updated = await updateCategory(id, v.data);
  if (!updated) return res.status(404).json({ message: 'not_found' });
  return res.json(updated);
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: 'invalid_id' });
  }

  const result = await deleteCategory(id);
  if (result === 'not_found') return res.status(404).json({ message: 'not_found' });
  if (result === 'in_use') return res.status(409).json({ message: 'category_in_use' });

  return res.status(204).send();
}
