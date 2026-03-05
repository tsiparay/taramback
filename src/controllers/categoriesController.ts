import type { Request, Response } from 'express';

import { validateCreateCategory, validateUpdateCategory } from '../utils/categoriesValidation';
import { createCategory, deleteCategory, getCategoryById, listCategories, updateCategory } from '../services/categoriesService';

export async function list(req: Request, res: Response) {
  const items = await listCategories();
  res.json(items);
}

export async function getById(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: 'invalid_id' });
  }

  const item = await getCategoryById(id);
  if (!item) return res.status(404).json({ message: 'not_found' });
  return res.json(item);
}

export async function create(req: Request, res: Response) {
  const v = validateCreateCategory(req.body ?? {});
  if (!v.ok) return res.status(400).json({ message: 'validation_error', details: v.errors });

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
