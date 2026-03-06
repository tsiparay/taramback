"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboard = getDashboard;
const db_1 = require("../utils/db");
async function getDashboard(params) {
    const where = [];
    const values = [];
    if (params.networkId !== undefined) {
        where.push('a.networkId = ?');
        values.push(params.networkId);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const totalsRow = await (0, db_1.get)(`SELECT COUNT(1) as articles
     FROM articles a
     ${whereSql}`, values);
    const byStatusRows = await (0, db_1.all)(`SELECT a.status as status, COUNT(1) as count
     FROM articles a
     ${whereSql}
     GROUP BY a.status`, values);
    const byNetworkRows = await (0, db_1.all)(`SELECT a.networkId as networkId, COUNT(1) as count
     FROM articles a
     ${whereSql}
     GROUP BY a.networkId
     ORDER BY a.networkId ASC`, values);
    // Category counts based on article_categories join table
    const categoryFilterSql = params.networkId !== undefined ? 'WHERE a.networkId = ?' : '';
    const categoryValues = params.networkId !== undefined ? [params.networkId] : [];
    const byCategoryRows = await (0, db_1.all)(`SELECT c.id as categoryId, c.name as name, COUNT(DISTINCT ac.articleId) as count
     FROM categories c
     LEFT JOIN article_categories ac ON ac.categoryId = c.id
     LEFT JOIN articles a ON a.id = ac.articleId
     ${categoryFilterSql}
     GROUP BY c.id
     ORDER BY count DESC, c.id ASC`, categoryValues);
    const latestPublished = await (0, db_1.all)(`SELECT a.id, a.title, a.publishedAt, a.networkId
     FROM articles a
     ${whereSql ? `${whereSql} AND a.status = 'published'` : "WHERE a.status = 'published'"}
     ORDER BY a.publishedAt DESC, a.id DESC
     LIMIT 5`, values);
    const latestNotifications = await (0, db_1.all)(`SELECT n.id, n.userId, n.articleId, n.type, n.sentAt
     FROM notifications n
     ORDER BY n.sentAt DESC
     LIMIT 5`);
    const byStatus = {};
    for (const r of byStatusRows)
        byStatus[r.status] = r.count;
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
