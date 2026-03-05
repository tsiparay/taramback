import { all, get, run } from '../utils/db';
import type { Article, ArticleStatus, CreateArticleInput, UpdateArticleInput } from '../models/article';
import { renderArticleNotificationHtml } from '../utils/emailTemplate';

type DbArticleRow = {
  id: number;
  title: string;
  content: string;
  status: ArticleStatus;
  featured: number;
  publishedAt: string | null;
  networkId: number;
  authorId: number;
};

type DbArticleCategoryRow = { categoryId: number };

type ListParams = {
  query?: string;
  status?: ArticleStatus;
  networkId?: number;
  featured?: boolean;
  categoryIds?: number[];
  page?: number;
  pageSize?: number;
  sort?: 'createdAt' | 'publishedAt' | 'title';
  order?: 'asc' | 'desc';
};

function toArticle(row: DbArticleRow, categoryIds: number[]): Article {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    status: row.status,
    featured: Boolean(row.featured),
    publishedAt: row.publishedAt ? new Date(row.publishedAt) : undefined,
    networkId: row.networkId,
    authorId: row.authorId,
    categoryIds,
  };
}

export async function listArticles(params: ListParams): Promise<{ items: Article[]; total: number; page: number; pageSize: number }> {
  const page = params.page && params.page > 0 ? params.page : 1;
  const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : 20;
  const offset = (page - 1) * pageSize;

  const where: string[] = [];
  const values: unknown[] = [];

  if (params.query) {
    where.push('(title LIKE ? OR content LIKE ?)');
    values.push(`%${params.query}%`, `%${params.query}%`);
  }
  if (params.status) {
    where.push('status = ?');
    values.push(params.status);
  }
  if (params.networkId !== undefined) {
    where.push('networkId = ?');
    values.push(params.networkId);
  }
  if (params.featured !== undefined) {
    where.push('featured = ?');
    values.push(params.featured ? 1 : 0);
  }

  const baseWhereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  // Category filter implemented via EXISTS to keep it simple
  let categoryWhereSql = '';
  if (params.categoryIds?.length) {
    const placeholders = params.categoryIds.map(() => '?').join(',');
    categoryWhereSql = `${baseWhereSql ? ' AND ' : 'WHERE '}EXISTS (
      SELECT 1 FROM article_categories ac
      WHERE ac.articleId = a.id AND ac.categoryId IN (${placeholders})
    )`;
    values.push(...params.categoryIds);
  }

  const sort = params.sort ?? 'publishedAt';
  const order = params.order ?? 'desc';
  const sortColumn = sort === 'title' ? 'title' : sort === 'createdAt' ? 'id' : 'publishedAt';

  const countRow = await get<{ total: number }>(
    `SELECT COUNT(1) as total FROM articles a ${baseWhereSql}${categoryWhereSql}`,
    values
  );

  const rows = await all<DbArticleRow>(
    `SELECT a.id, a.title, a.content, a.status, a.featured, a.publishedAt, a.networkId, a.authorId
     FROM articles a
     ${baseWhereSql}${categoryWhereSql}
     ORDER BY ${sortColumn} ${order.toUpperCase()}
     LIMIT ? OFFSET ?`,
    [...values, pageSize, offset]
  );

  const items: Article[] = [];
  for (const r of rows) {
    const cats = await all<DbArticleCategoryRow>('SELECT categoryId FROM article_categories WHERE articleId = ? ORDER BY categoryId ASC', [
      r.id,
    ]);
    items.push(toArticle(r, cats.map((c) => c.categoryId)));
  }

  return { items, total: countRow?.total ?? 0, page, pageSize };
}

export async function getArticleById(id: number): Promise<Article | null> {
  const row = await get<DbArticleRow>(
    'SELECT id, title, content, status, featured, publishedAt, networkId, authorId FROM articles WHERE id = ? LIMIT 1',
    [id]
  );

  if (!row) return null;

  const cats = await all<DbArticleCategoryRow>('SELECT categoryId FROM article_categories WHERE articleId = ? ORDER BY categoryId ASC', [
    id,
  ]);
  return toArticle(row, cats.map((c) => c.categoryId));
}

export async function createArticle(input: CreateArticleInput): Promise<Article> {
  const status: ArticleStatus = input.status ?? 'draft';
  const featured = input.featured ? 1 : 0;
  const publishedAt = input.publishedAt ? input.publishedAt.toISOString() : null;

  await run(
    'INSERT INTO articles (title, content, status, featured, publishedAt, categoryId, networkId, authorId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [input.title, input.content, status, featured, publishedAt, null, input.networkId, input.authorId]
  );

  const created = await get<{ id: number }>('SELECT last_insert_rowid() as id');
  const id = created?.id as number;

  for (const cid of input.categoryIds) {
    await run('INSERT INTO article_categories (articleId, categoryId) VALUES (?, ?)', [id, cid]);
  }

  const article = await getArticleById(id);
  if (!article) throw new Error('create_failed');
  return article;
}

export async function updateArticle(id: number, input: UpdateArticleInput): Promise<Article | null> {
  const existing = await getArticleById(id);
  if (!existing) return null;

  const next = {
    title: input.title ?? existing.title,
    content: input.content ?? existing.content,
    status: input.status ?? existing.status,
    featured: input.featured ?? existing.featured,
    publishedAt: input.publishedAt === undefined ? existing.publishedAt : input.publishedAt ?? undefined,
    networkId: input.networkId ?? existing.networkId,
    authorId: input.authorId ?? existing.authorId,
  };

  await run(
    'UPDATE articles SET title = ?, content = ?, status = ?, featured = ?, publishedAt = ?, networkId = ?, authorId = ? WHERE id = ?',
    [
      next.title,
      next.content,
      next.status,
      next.featured ? 1 : 0,
      next.publishedAt ? next.publishedAt.toISOString() : null,
      next.networkId,
      next.authorId,
      id,
    ]
  );

  if (input.categoryIds) {
    await run('DELETE FROM article_categories WHERE articleId = ?', [id]);
    for (const cid of input.categoryIds) {
      await run('INSERT INTO article_categories (articleId, categoryId) VALUES (?, ?)', [id, cid]);
    }
  }

  return await getArticleById(id);
}

export async function deleteArticle(id: number): Promise<boolean> {
  const existing = await getArticleById(id);
  if (!existing) return false;

  await run('DELETE FROM articles WHERE id = ?', [id]);
  return true;
}

export async function patchArticleStatus(id: number, status: ArticleStatus): Promise<Article | null> {
  const existing = await getArticleById(id);
  if (!existing) return null;

  await run('UPDATE articles SET status = ? WHERE id = ?', [status, id]);
  return await getArticleById(id);
}

export async function notifyArticle(
  id: number,
  type: 'new_article' | 'update',
  recipients: string[],
  subject?: string
): Promise<{ message: string } | null> {
  const existing = await getArticleById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const resolvedSubject = subject ?? `Nouvel article: ${existing.title}`;
  const html = renderArticleNotificationHtml({ article: existing, subject: resolvedSubject });

  // For now: store as sent (no SMTP integration). If you later add SMTP, set status based on send result.
  const status = 'sent';
  const error = null;

  await run(
    'INSERT INTO notifications (userId, articleId, type, recipientsJson, subject, status, error, sentAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [1, id, type, JSON.stringify(recipients), resolvedSubject, status, error, now]
  );

  return { message: 'sent' };
}
