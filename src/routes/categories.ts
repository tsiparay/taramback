import { Router } from 'express';

import { requireRole } from '../utils/permissions';
import { validateRequest } from '../utils/validate';
import { Role } from '../types/permissions';
import { all } from '../utils/db';

const router = Router();

router.get('/', async (req, res) => {
  const rows = await all<{ id: number; name: string; description: string; networkId: number }>(
    'SELECT id, name, description, networkId FROM categories ORDER BY id ASC'
  );

  res.json(rows);
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
