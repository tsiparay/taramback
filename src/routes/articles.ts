import { Router } from 'express';

import { requireRole } from '../utils/permissions';
import { validateRequest } from '../utils/validate';
import { Role } from '../types/permissions';
import { all, get } from '../utils/db';

const router = Router();

type DbArticleRow = {
  id: number;
  title: string;
  content: string;
  status: 'draft' | 'published';
  featured: number;
  publishedAt: string | null;
  categoryId: number;
  networkId: number;
  authorId: number;
};

router.get('/', async (req, res) => {
  const rows = await all<DbArticleRow>(
    'SELECT id, title, content, status, featured, publishedAt, categoryId, networkId, authorId FROM articles ORDER BY id ASC'
  );

  res.json(
    rows.map((r) => ({
      ...r,
      featured: Boolean(r.featured),
      publishedAt: r.publishedAt ? new Date(r.publishedAt) : undefined,
    }))
  );
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const row = await get<DbArticleRow>(
    'SELECT id, title, content, status, featured, publishedAt, categoryId, networkId, authorId FROM articles WHERE id = ? LIMIT 1',
    [id]
  );

  if (!row) {
    return res.status(404).json({ message: 'not_found' });
  }

  return res.json({
    ...row,
    featured: Boolean(row.featured),
    publishedAt: row.publishedAt ? new Date(row.publishedAt) : undefined,
  });
});

router.post('/', validateRequest, requireRole([Role.ADMIN, Role.EDITOR]), (req, res) => {
  res.json({ message: 'ok' });
});

router.put('/:id', validateRequest, requireRole([Role.ADMIN, Role.EDITOR]), (req, res) => {
  res.json({ message: 'ok' });
});

router.delete('/:id', requireRole([Role.ADMIN]), (req, res) => {
  res.json({ message: 'ok' });
});

export default router;
