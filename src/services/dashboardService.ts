import { all, get } from '../utils/db';

export type DashboardResponse = {
  totals: {
    articles: number;
  };
  byStatus: Record<string, number>;
  byNetwork: { networkId: number; count: number }[];
  byCategory: { categoryId: number; name: string; count: number }[];
  latestPublished: { id: number; title: string; publishedAt: string | null; networkId: number }[];
  latestNotifications: { id: number; userId: number; articleId: number; type: string; sentAt: string }[];
};

type Params = {
  networkId?: number;
};

export async function getDashboard(params: Params): Promise<DashboardResponse> {
  const where: string[] = [];
  const values: unknown[] = [];

  if (params.networkId !== undefined) {
    where.push('a.networkId = ?');
    values.push(params.networkId);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const totalsRow = await get<{ articles: number }>(
    `SELECT COUNT(1) as articles
     FROM articles a
     ${whereSql}`,
    values
  );

  const byStatusRows = await all<{ status: string; count: number }>(
    `SELECT a.status as status, COUNT(1) as count
     FROM articles a
     ${whereSql}
     GROUP BY a.status`,
    values
  );

  const byNetworkRows = await all<{ networkId: number; count: number }>(
    `SELECT a.networkId as networkId, COUNT(1) as count
     FROM articles a
     ${whereSql}
     GROUP BY a.networkId
     ORDER BY a.networkId ASC`,
    values
  );

  // Category counts based on article_categories join table
  const categoryFilterSql = params.networkId !== undefined ? 'WHERE a.networkId = ?' : '';
  const categoryValues = params.networkId !== undefined ? [params.networkId] : [];

  const byCategoryRows = await all<{ categoryId: number; name: string; count: number }>(
    `SELECT c.id as categoryId, c.name as name, COUNT(DISTINCT ac.articleId) as count
     FROM categories c
     LEFT JOIN article_categories ac ON ac.categoryId = c.id
     LEFT JOIN articles a ON a.id = ac.articleId
     ${categoryFilterSql}
     GROUP BY c.id
     ORDER BY count DESC, c.id ASC`,
    categoryValues
  );

  const latestPublished = await all<{ id: number; title: string; publishedAt: string | null; networkId: number }>(
    `SELECT a.id, a.title, a.publishedAt, a.networkId
     FROM articles a
     ${whereSql ? `${whereSql} AND a.status = 'published'` : "WHERE a.status = 'published'"}
     ORDER BY a.publishedAt DESC, a.id DESC
     LIMIT 5`,
    values
  );

  const latestNotifications = await all<{ id: number; userId: number; articleId: number; type: string; sentAt: string }>(
    `SELECT n.id, n.userId, n.articleId, n.type, n.sentAt
     FROM notifications n
     ORDER BY n.sentAt DESC
     LIMIT 5`
  );

  const byStatus: Record<string, number> = {};
  for (const r of byStatusRows) byStatus[r.status] = r.count;

  return {
    totals: {
      articles: totalsRow?.articles ?? 0,
    },
    byStatus,
    byNetwork: byNetworkRows,
    byCategory: byCategoryRows,
    latestPublished,
    latestNotifications,
  };
}
