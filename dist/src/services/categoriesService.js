"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCategories = listCategories;
exports.getCategoryById = getCategoryById;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
const db_1 = require("../utils/db");
function toCategoryWithCount(r) {
    return {
        id: r.id,
        name: r.name,
        description: r.description,
        networkId: r.networkId,
        articlesCount: r.articlesCount ?? 0,
    };
}
async function listCategories() {
    const rows = await (0, db_1.all)(`SELECT c.id, c.name, c.description, c.networkId,
            COUNT(DISTINCT ac.articleId) as articlesCount
     FROM categories c
     LEFT JOIN article_categories ac ON ac.categoryId = c.id
     GROUP BY c.id
     ORDER BY c.id ASC`);
    return rows.map(toCategoryWithCount);
}
async function getCategoryById(id) {
    const row = await (0, db_1.get)(`SELECT c.id, c.name, c.description, c.networkId,
            COUNT(DISTINCT ac.articleId) as articlesCount
     FROM categories c
     LEFT JOIN article_categories ac ON ac.categoryId = c.id
     WHERE c.id = ?
     GROUP BY c.id
     LIMIT 1`, [id]);
    if (!row)
        return null;
    return toCategoryWithCount(row);
}
async function createCategory(input) {
    await (0, db_1.run)('INSERT INTO categories (name, description, networkId) VALUES (?, ?, ?)', [
        input.name,
        input.description,
        input.networkId,
    ]);
    const created = await (0, db_1.get)('SELECT last_insert_rowid() as id');
    const id = created?.id;
    const cat = await getCategoryById(id);
    if (!cat)
        throw new Error('create_failed');
    return cat;
}
async function updateCategory(id, input) {
    const existing = await getCategoryById(id);
    if (!existing)
        return null;
    const next = {
        name: input.name ?? existing.name,
        description: input.description ?? existing.description,
        networkId: input.networkId ?? existing.networkId,
    };
    await (0, db_1.run)('UPDATE categories SET name = ?, description = ?, networkId = ? WHERE id = ?', [
        next.name,
        next.description,
        next.networkId,
        id,
    ]);
    return await getCategoryById(id);
}
async function deleteCategory(id) {
    const existing = await getCategoryById(id);
    if (!existing)
        return 'not_found';
    const used = await (0, db_1.get)('SELECT COUNT(1) as cnt FROM article_categories WHERE categoryId = ? LIMIT 1', [id]);
    if ((used?.cnt ?? 0) > 0)
        return 'in_use';
    await (0, db_1.run)('DELETE FROM categories WHERE id = ?', [id]);
    return 'deleted';
}
