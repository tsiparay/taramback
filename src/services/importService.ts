import { all, get } from '../utils/db';
import { createArticle } from './articlesService';
import { run } from '../utils/db';

export type ImportArticleInput = {
  title?: unknown;
  content?: unknown;
  excerpt?: unknown;
  author?: unknown;
  category?: unknown;
  network?: unknown;
};

export type ImportResultItem = {
  index: number;
  ok: boolean;
  articleId?: number;
  errors?: { field: string; message: string }[];
};

export type ImportArticlesResponse = {
  total: number;
  successCount: number;
  errorCount: number;
  items: ImportResultItem[];
};

type DbNetworkRow = { id: number; name: string };
type DbCategoryRow = { id: number; name: string; networkId: number };
type DbUserRow = { id: number; username: string };

function asString(v: unknown): string | null {
  return typeof v === 'string' ? v.trim() : null;
}

export async function importArticles(items: ImportArticleInput[]): Promise<ImportArticlesResponse> {
  const networks = await all<DbNetworkRow>('SELECT id, name FROM networks');
  const categories = await all<DbCategoryRow>('SELECT id, name, networkId FROM categories');
  const users = await all<DbUserRow>('SELECT id, username FROM users');

  const results: ImportResultItem[] = [];

  for (let i = 0; i < items.length; i += 1) {
    const it = items[i];
    const errors: { field: string; message: string }[] = [];

    const title = asString(it.title) ?? '';
    const content = asString(it.content) ?? '';
    const excerpt = asString(it.excerpt);
    const author = asString(it.author);
    const categoryName = asString(it.category);
    const networkName = asString(it.network);

    if (!title || title.length < 5) errors.push({ field: 'title', message: 'min_5' });
    if (!content || content.length < 50) errors.push({ field: 'content', message: 'min_50' });
    if (!categoryName) errors.push({ field: 'category', message: 'required' });
    if (!networkName) errors.push({ field: 'network', message: 'required' });

    const network = networkName ? networks.find((n) => n.name === networkName) : undefined;
    if (networkName && !network) errors.push({ field: 'network', message: 'not_found' });

    const category =
      categoryName && network
        ? categories.find((c) => c.name === categoryName && c.networkId === network.id)
        : undefined;
    if (categoryName && network && !category) errors.push({ field: 'category', message: 'not_found' });

    const user = author ? users.find((u) => u.username === author) : undefined;
    if (author && !user) errors.push({ field: 'author', message: 'not_found' });

    if (errors.length) {
      results.push({ index: i, ok: false, errors });
      continue;
    }

    try {
      // If excerpt is provided, append it to content as first paragraph (no schema field exists)
      const finalContent = excerpt ? `${excerpt}\n\n${content}` : content;

      const created = await createArticle({
        title,
        content: finalContent,
        status: 'draft',
        featured: false,
        publishedAt: null,
        networkId: network!.id,
        authorId: user ? user.id : 1,
        categoryIds: [category!.id],
      });

      results.push({ index: i, ok: true, articleId: created.id });
    } catch (e) {
      results.push({ index: i, ok: false, errors: [{ field: 'unknown', message: 'create_failed' }] });
    }
  }

  const successCount = results.filter((r) => r.ok).length;
  const errorCount = results.length - successCount;

  return {
    total: items.length,
    successCount,
    errorCount,
    items: results,
  };
}
