import { Router } from 'express';

import { all } from '../utils/db';

type DbNotificationRow = {
  id: number;
  userId: number;
  articleId: number;
  type: 'new_article' | 'update';
  recipientsJson: string;
  subject: string | null;
  status: 'sent' | 'failed';
  error: string | null;
  sentAt: string;
  articleTitle: string;
};

const router = Router();

router.get('/', async (req, res) => {
  const rows = await all<DbNotificationRow>(
    `SELECT n.id, n.userId, n.articleId, n.type, n.recipientsJson, n.subject, n.status, n.error, n.sentAt,
            a.title as articleTitle
     FROM notifications n
     LEFT JOIN articles a ON a.id = n.articleId
     ORDER BY n.sentAt DESC`
  );

  res.json(
    rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      articleId: r.articleId,
      articleTitle: r.articleTitle,
      type: r.type,
      subject: r.subject,
      status: r.status,
      error: r.error,
      recipientsCount: safeRecipientsCount(r.recipientsJson),
      sentAt: new Date(r.sentAt),
    }))
  );
});

function safeRecipientsCount(recipientsJson: string): number {
  try {
    const arr = JSON.parse(recipientsJson);
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

export default router;
