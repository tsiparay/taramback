"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../utils/db");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    const rows = await (0, db_1.all)(`SELECT n.id, n.userId, n.articleId, n.type, n.recipientsJson, n.subject, n.status, n.error, n.sentAt,
            a.title as articleTitle
     FROM notifications n
     LEFT JOIN articles a ON a.id = n.articleId
     ORDER BY n.sentAt DESC`);
    res.json(rows.map((r) => ({
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
    })));
});
function safeRecipientsCount(recipientsJson) {
    try {
        const arr = JSON.parse(recipientsJson);
        return Array.isArray(arr) ? arr.length : 0;
    }
    catch {
        return 0;
    }
}
exports.default = router;
