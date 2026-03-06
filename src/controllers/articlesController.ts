import { Request, Response } from 'express';

import { validateCreateArticle, validateUpdateArticle, validatePatchStatus, validateNotify } from '../utils/articlesValidation';
import { createArticle, deleteArticle, getArticleById, listArticles, notifyArticle, patchArticleStatus, updateArticle } from '../services/articlesService';
import { Role } from '../types/permissions';

export async function list(req: Request, res: Response) {
  const currentUser = (req as any).user as { role: string; networkId: number } | undefined;

  const page = req.query.page ? Number(req.query.page) : undefined;
  const pageSize = req.query.pageSize ? Number(req.query.pageSize) : undefined;

  const categoryIds = typeof req.query.categoryIds === 'string'
    ? req.query.categoryIds.split(',').map((v) => Number(v)).filter((n) => !Number.isNaN(n))
    : undefined;

  const networkIdRaw = typeof req.query.networkId === 'string' ? Number(req.query.networkId) : undefined;
  const networkId = networkIdRaw !== undefined && Number.isFinite(networkIdRaw) ? networkIdRaw : undefined;

  const effectiveNetworkId = currentUser && currentUser.role !== Role.ADMIN ? currentUser.networkId : networkId;

  const result = await listArticles({
    query: typeof req.query.query === 'string' ? req.query.query : undefined,
    status: typeof req.query.status === 'string' ? (req.query.status as any) : undefined,
    networkId: effectiveNetworkId,
    featured: typeof req.query.featured === 'string' ? req.query.featured === 'true' : undefined,
    categoryIds,
    page,
    pageSize,
    sort: typeof req.query.sort === 'string' ? (req.query.sort as any) : undefined,
    order: typeof req.query.order === 'string' ? (req.query.order as any) : undefined,
  });

  res.json(result);
}

export async function getById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const article = await getArticleById(id);

  if (!article) {
    return res.status(404).json({ message: 'not_found' });
  }

  const currentUser = (req as any).user as { role: string; networkId: number } | undefined;
  if (currentUser && currentUser.role !== Role.ADMIN && article.networkId !== currentUser.networkId) {
    return res.status(403).json({ message: 'forbidden' });
  }

  return res.json(article);
}

export async function create(req: Request, res: Response) {
  const currentUser = (req as any).user as { role: string; networkId: number } | undefined;
  const v = validateCreateArticle(req.body);
  if (!v.ok) {
    return res.status(400).json({ message: 'validation_error', details: v.errors });
  }

  if (currentUser && currentUser.role !== Role.ADMIN && v.data.networkId !== currentUser.networkId) {
    return res.status(403).json({ message: 'forbidden' });
  }

  const article = await createArticle(v.data);
  return res.status(201).json(article);
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);

  const currentUser = (req as any).user as { role: string; networkId: number } | undefined;
  const existing = await getArticleById(id);
  if (!existing) {
    return res.status(404).json({ message: 'not_found' });
  }
  if (currentUser && currentUser.role !== Role.ADMIN && existing.networkId !== currentUser.networkId) {
    return res.status(403).json({ message: 'forbidden' });
  }

  const v = validateUpdateArticle(req.body);
  if (!v.ok) {
    return res.status(400).json({ message: 'validation_error', details: v.errors });
  }

  if (currentUser && currentUser.role !== Role.ADMIN && v.data.networkId !== undefined && v.data.networkId !== currentUser.networkId) {
    return res.status(403).json({ message: 'forbidden' });
  }

  const article = await updateArticle(id, v.data);
  if (!article) {
    return res.status(404).json({ message: 'not_found' });
  }

  return res.json(article);
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  const ok = await deleteArticle(id);

  if (!ok) {
    return res.status(404).json({ message: 'not_found' });
  }

  return res.status(204).send();
}

export async function patchStatus(req: Request, res: Response) {
  const id = Number(req.params.id);

  const currentUser = (req as any).user as { role: string; networkId: number } | undefined;
  const existing = await getArticleById(id);
  if (!existing) {
    return res.status(404).json({ message: 'not_found' });
  }
  if (currentUser && currentUser.role !== Role.ADMIN && existing.networkId !== currentUser.networkId) {
    return res.status(403).json({ message: 'forbidden' });
  }

  const v = validatePatchStatus(req.body);
  if (!v.ok) {
    return res.status(400).json({ message: 'validation_error', details: v.errors });
  }

  const article = await patchArticleStatus(id, v.data.status);
  if (!article) {
    return res.status(404).json({ message: 'not_found' });
  }

  return res.json(article);
}

export async function notify(req: Request, res: Response) {
  const id = Number(req.params.id);

  const currentUser = (req as any).user as { role: string; networkId: number } | undefined;
  const existing = await getArticleById(id);
  if (!existing) {
    return res.status(404).json({ message: 'not_found' });
  }
  if (currentUser && currentUser.role !== Role.ADMIN && existing.networkId !== currentUser.networkId) {
    return res.status(403).json({ message: 'forbidden' });
  }

  const v = validateNotify(req.body);
  if (!v.ok) {
    return res.status(400).json({ message: 'validation_error', details: v.errors });
  }

  const userId = (req as any).user?.id;
  const result = await notifyArticle(id, v.data.type, v.data.recipients, v.data.subject, Number.isFinite(userId) ? userId : 1);
  if (!result) {
    return res.status(404).json({ message: 'not_found' });
  }

  return res.json(result);
}
