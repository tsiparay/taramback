"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = listUsers;
exports.getUserById = getUserById;
exports.updateUser = updateUser;
const db_1 = require("../utils/db");
function toUser(r) {
    return {
        id: r.id,
        username: r.username,
        email: r.email,
        role: r.role,
        networkId: r.networkId,
    };
}
async function listUsers() {
    const rows = await (0, db_1.all)('SELECT id, username, email, role, networkId FROM users ORDER BY id ASC');
    return rows.map(toUser);
}
async function getUserById(id) {
    const row = await (0, db_1.get)('SELECT id, username, email, role, networkId FROM users WHERE id = ? LIMIT 1', [id]);
    return row ? toUser(row) : null;
}
async function updateUser(id, input) {
    const existing = await getUserById(id);
    if (!existing)
        return null;
    const nextRole = input.role ?? existing.role;
    const nextNetworkId = input.networkId ?? existing.networkId;
    await (0, db_1.run)('UPDATE users SET role = ?, networkId = ? WHERE id = ?', [nextRole, nextNetworkId, id]);
    return getUserById(id);
}
