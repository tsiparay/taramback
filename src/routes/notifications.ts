import { Router } from 'express';

import { all } from '../utils/db';

type DbNotificationRow = {
  id: number;
  userId: number;
  articleId: number;
  type: 'new_article' | 'update';
  sentAt: string;
};

const router = Router();

router.get('/', async (req, res) => {
  const rows = await all<DbNotificationRow>(
    'SELECT id, userId, articleId, type, sentAt FROM notifications ORDER BY sentAt DESC'
  );

  res.json(
    rows.map((r) => ({
      ...r,
      sentAt: new Date(r.sentAt),
    }))
  );
});

export default router;
