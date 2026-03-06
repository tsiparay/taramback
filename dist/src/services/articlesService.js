"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listArticles = listArticles;
exports.getArticleById = getArticleById;
exports.createArticle = createArticle;
exports.updateArticle = updateArticle;
exports.deleteArticle = deleteArticle;
exports.patchArticleStatus = patchArticleStatus;
exports.notifyArticle = notifyArticle;
const db_1 = require("../utils/db");
const emailTemplate_1 = require("../utils/emailTemplate");
function toArticle(row, categoryIds) {
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
async function listArticles(params) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : 20;
    const offset = (page - 1) * pageSize;
    const where = [];
    const values = [];
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
    const countRow = await (0, db_1.get)(`SELECT COUNT(1) as total FROM articles a ${baseWhereSql}${categoryWhereSql}`, values);
    const rows = await (0, db_1.all)(`SELECT a.id, a.title, a.content, a.status, a.featured, a.publishedAt, a.networkId, a.authorId
     FROM articles a
     ${baseWhereSql}${categoryWhereSql}
     ORDER BY ${sortColumn} ${order.toUpperCase()}
     LIMIT ? OFFSET ?`, [...values, pageSize, offset]);
    const items = [];
    for (const r of rows) {
        const cats = await (0, db_1.all)('SELECT categoryId FROM article_categories WHERE articleId = ? ORDER BY categoryId ASC', [
            r.id,
        ]);
        items.push(toArticle(r, cats.map((c) => c.categoryId)));
    }
    return { items, total: countRow?.total ?? 0, page, pageSize };
}
async function getArticleById(id) {
    const row = await (0, db_1.get)('SELECT id, title, content, status, featured, publishedAt, networkId, authorId FROM articles WHERE id = ? LIMIT 1', [id]);
    if (!row)
        return null;
    const cats = await (0, db_1.all)('SELECT categoryId FROM article_categories WHERE articleId = ? ORDER BY categoryId ASC', [
        id,
    ]);
    return toArticle(row, cats.map((c) => c.categoryId));
}
async function createArticle(input) {
    const status = input.status ?? 'draft';
    const featured = input.featured ? 1 : 0;
    const publishedAt = input.publishedAt ? input.publishedAt.toISOString() : null;
    await (0, db_1.run)('INSERT INTO articles (title, content, status, featured, publishedAt, categoryId, networkId, authorId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [input.title, input.content, status, featured, publishedAt, null, input.networkId, input.authorId]);
    const created = await (0, db_1.get)('SELECT last_insert_rowid() as id');
    const id = created?.id;
    for (const cid of input.categoryIds) {
        await (0, db_1.run)('INSERT INTO article_categories (articleId, categoryId) VALUES (?, ?)', [id, cid]);
    }
    const article = await getArticleById(id);
    if (!article)
        throw new Error('create_failed');
    return article;
}
async function updateArticle(id, input) {
    const existing = await getArticleById(id);
    if (!existing)
        return null;
    const next = {
        title: input.title ?? existing.title,
        content: input.content ?? existing.content,
        status: input.status ?? existing.status,
        featured: input.featured ?? existing.featured,
        publishedAt: input.publishedAt === undefined ? existing.publishedAt : input.publishedAt ?? undefined,
        networkId: input.networkId ?? existing.networkId,
        authorId: input.authorId ?? existing.authorId,
    };
    await (0, db_1.run)('UPDATE articles SET title = ?, content = ?, status = ?, featured = ?, publishedAt = ?, networkId = ?, authorId = ? WHERE id = ?', [
        next.title,
        next.content,
        next.status,
        next.featured ? 1 : 0,
        next.publishedAt ? next.publishedAt.toISOString() : null,
        next.networkId,
        next.authorId,
        id,
    ]);
    if (input.categoryIds) {
        await (0, db_1.run)('DELETE FROM article_categories WHERE articleId = ?', [id]);
        for (const cid of input.categoryIds) {
            await (0, db_1.run)('INSERT INTO article_categories (articleId, categoryId) VALUES (?, ?)', [id, cid]);
        }
    }
    return await getArticleById(id);
}
async function deleteArticle(id) {
    const existing = await getArticleById(id);
    if (!existing)
        return false;
    await (0, db_1.run)('DELETE FROM articles WHERE id = ?', [id]);
    return true;
}
async function patchArticleStatus(id, status) {
    const existing = await getArticleById(id);
    if (!existing)
        return null;
    await (0, db_1.run)('UPDATE articles SET status = ? WHERE id = ?', [status, id]);
    return await getArticleById(id);
}
async function notifyArticle(id, type, recipients, subject) {
    const existing = await getArticleById(id);
    if (!existing)
        return null;
    const now = new Date().toISOString();
    const resolvedSubject = subject ?? `Nouvel article: ${existing.title}`;
    const html = (0, emailTemplate_1.renderArticleNotificationHtml)({ article: existing, subject: resolvedSubject });
    // For now: store as sent (no SMTP integration). If you later add SMTP, set status based on send result.
    const status = 'sent';
    const error = null;
    await (0, db_1.run)('INSERT INTO notifications (userId, articleId, type, recipientsJson, subject, status, error, sentAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [1, id, type, JSON.stringify(recipients), resolvedSubject, status, error, now]);
    return { message: 'sent' };
}
