"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importArticles = importArticles;
const db_1 = require("../utils/db");
const articlesService_1 = require("./articlesService");
function asString(v) {
    return typeof v === 'string' ? v.trim() : null;
}
async function importArticles(items) {
    const networks = await (0, db_1.all)('SELECT id, name FROM networks');
    const categories = await (0, db_1.all)('SELECT id, name, networkId FROM categories');
    const users = await (0, db_1.all)('SELECT id, username FROM users');
    const results = [];
    for (let i = 0; i < items.length; i += 1) {
        const it = items[i];
        const errors = [];
        const title = asString(it.title) ?? '';
        const content = asString(it.content) ?? '';
        const excerpt = asString(it.excerpt);
        const author = asString(it.author);
        const categoryName = asString(it.category);
        const networkName = asString(it.network);
        if (!title || title.length < 5)
            errors.push({ field: 'title', message: 'min_5' });
        if (!content || content.length < 50)
            errors.push({ field: 'content', message: 'min_50' });
        if (!categoryName)
            errors.push({ field: 'category', message: 'required' });
        if (!networkName)
            errors.push({ field: 'network', message: 'required' });
        const network = networkName ? networks.find((n) => n.name === networkName) : undefined;
        if (networkName && !network)
            errors.push({ field: 'network', message: 'not_found' });
        const category = categoryName && network
            ? categories.find((c) => c.name === categoryName && c.networkId === network.id)
            : undefined;
        if (categoryName && network && !category)
            errors.push({ field: 'category', message: 'not_found' });
        const user = author ? users.find((u) => u.username === author) : undefined;
        if (author && !user)
            errors.push({ field: 'author', message: 'not_found' });
        if (errors.length) {
            results.push({ index: i, ok: false, errors });
            continue;
        }
        try {
            // If excerpt is provided, append it to content as first paragraph (no schema field exists)
            const finalContent = excerpt ? `${excerpt}\n\n${content}` : content;
            const created = await (0, articlesService_1.createArticle)({
                title,
                content: finalContent,
                status: 'draft',
                featured: false,
                publishedAt: null,
                networkId: network.id,
                authorId: user ? user.id : 1,
                categoryIds: [category.id],
            });
            results.push({ index: i, ok: true, articleId: created.id });
        }
        catch (e) {
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
