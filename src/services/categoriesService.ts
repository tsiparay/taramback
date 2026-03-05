import { all, get, run } from '../utils/db';
import type { Category } from '../types/entities';

export type CategoryWithCount = Category & {
  articlesCount: number;
};

type DbCategoryRow = {
  id: number;
  name: string;
  description: string;
  networkId: number;
  articlesCount?: number;
};

export type CreateCategoryInput = {
  name: string;
  description: string;
  networkId: number;
};

export type UpdateCategoryInput = {
  name?: string;
  description?: string;
  networkId?: number;
};

function toCategoryWithCount(r: DbCategoryRow): CategoryWithCount {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    networkId: r.networkId,
    articlesCount: r.articlesCount ?? 0,
  };
}

export async function listCategories(): Promise<CategoryWithCount[]> {
  const rows = await all<DbCategoryRow>(
    `SELECT c.id, c.name, c.description, c.networkId,
            COUNT(DISTINCT ac.articleId) as articlesCount
     FROM categories c
     LEFT JOIN article_categories ac ON ac.categoryId = c.id
     GROUP BY c.id
     ORDER BY c.id ASC`
  );

  return rows.map(toCategoryWithCount);
}

export async function getCategoryById(id: number): Promise<CategoryWithCount | null> {
  const row = await get<DbCategoryRow>(
    `SELECT c.id, c.name, c.description, c.networkId,
            COUNT(DISTINCT ac.articleId) as articlesCount
     FROM categories c
     LEFT JOIN article_categories ac ON ac.categoryId = c.id
     WHERE c.id = ?
     GROUP BY c.id
     LIMIT 1`,
    [id]
  );

  if (!row) return null;
  return toCategoryWithCount(row);
}

export async function createCategory(input: CreateCategoryInput): Promise<CategoryWithCount> {
  await run('INSERT INTO categories (name, description, networkId) VALUES (?, ?, ?)', [
    input.name,
    input.description,
    input.networkId,
  ]);

  const created = await get<{ id: number }>('SELECT last_insert_rowid() as id');
  const id = created?.id as number;

  const cat = await getCategoryById(id);
  if (!cat) throw new Error('create_failed');
  return cat;
}

export async function updateCategory(id: number, input: UpdateCategoryInput): Promise<CategoryWithCount | null> {
  const existing = await getCategoryById(id);
  if (!existing) return null;

  const next = {
    name: input.name ?? existing.name,
    description: input.description ?? existing.description,
    networkId: input.networkId ?? existing.networkId,
  };

  await run('UPDATE categories SET name = ?, description = ?, networkId = ? WHERE id = ?', [
    next.name,
    next.description,
    next.networkId,
    id,
  ]);

  return await getCategoryById(id);
}

export async function deleteCategory(id: number): Promise<'deleted' | 'not_found' | 'in_use'> {
  const existing = await getCategoryById(id);
  if (!existing) return 'not_found';

  const used = await get<{ cnt: number }>(
    'SELECT COUNT(1) as cnt FROM article_categories WHERE categoryId = ? LIMIT 1',
    [id]
  );

  if ((used?.cnt ?? 0) > 0) return 'in_use';

  await run('DELETE FROM categories WHERE id = ?', [id]);
  return 'deleted';
}
