import { Router } from 'express';

import { requireRole } from '../utils/permissions';
import { validateRequest } from '../utils/validate';
import { Role } from '../types/permissions';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'ok' });
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
