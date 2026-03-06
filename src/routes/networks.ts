import { Router } from 'express';

import { all } from '../utils/db';
import { getCurrentUser } from '../utils/auth';
import { Role } from '../types/permissions';

const router = Router();

router.get('/', async (req, res) => {
  const rows = await all<{ id: number; name: string; description: string }>(
    'SELECT id, name, description FROM networks ORDER BY id ASC'
  );

  const hasUserHeader = Boolean(req.header('x-user-id'));
  if (!hasUserHeader) {
    return res.json(rows);
  }

  const user = await getCurrentUser(req);
  if (user.role !== Role.ADMIN) {
    return res.json(rows.filter((n) => n.id === user.networkId));
  }

  return res.json(rows);
});

export default router;
