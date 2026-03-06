"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = getCurrentUser;
const db_1 = require("./db");
async function getCurrentUser(req) {
    const userIdRaw = req.header('x-user-id');
    const userId = userIdRaw ? Number(userIdRaw) : NaN;
    if (!Number.isFinite(userId)) {
        // Default to admin user 1 for local/dev.
        const fallback = await (0, db_1.get)('SELECT id, username, email, role, networkId FROM users WHERE id = 1 LIMIT 1');
        if (fallback) {
            return {
                id: fallback.id,
                username: fallback.username,
                email: fallback.email,
                role: fallback.role,
                networkId: fallback.networkId,
            };
        }
        return { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin', networkId: 1 };
    }
    const row = await (0, db_1.get)('SELECT id, username, email, role, networkId FROM users WHERE id = ? LIMIT 1', [userId]);
    if (!row) {
        return { id: userId, username: `user${userId}`, email: `user${userId}@example.com`, role: 'user', networkId: 1 };
    }
    return {
        id: row.id,
        username: row.username,
        email: row.email,
        role: row.role,
        networkId: row.networkId,
    };
}
