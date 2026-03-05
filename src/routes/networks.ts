import { Router } from 'express';

import { all } from '../utils/db';

const router = Router();

router.get('/', async (req, res) => {
  const rows = await all<{ id: number; name: string; description: string }>(
    'SELECT id, name, description FROM networks ORDER BY id ASC'
  );

  res.json(rows);
});

export default router;
