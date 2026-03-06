"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = list;
exports.getById = getById;
exports.update = update;
const permissions_1 = require("../types/permissions");
const usersService_1 = require("../services/usersService");
function parseId(req) {
    const id = Number(req.params.id);
    if (!Number.isFinite(id))
        return null;
    return id;
}
async function list(req, res) {
    const users = await (0, usersService_1.listUsers)();
    return res.json(users);
}
async function getById(req, res) {
    const id = parseId(req);
    if (id === null)
        return res.status(400).json({ message: 'invalid_id' });
    const user = await (0, usersService_1.getUserById)(id);
    if (!user)
        return res.status(404).json({ message: 'not_found' });
    return res.json(user);
}
async function update(req, res) {
    const id = parseId(req);
    if (id === null)
        return res.status(400).json({ message: 'invalid_id' });
    const body = (req.body ?? {});
    const next = {};
    if (body.role !== undefined) {
        if (body.role !== permissions_1.Role.ADMIN && body.role !== permissions_1.Role.EDITOR && body.role !== permissions_1.Role.USER) {
            return res.status(400).json({ message: 'validation_error', details: [{ field: 'role', message: 'invalid' }] });
        }
        next.role = body.role;
    }
    if (body.networkId !== undefined) {
        const n = Number(body.networkId);
        if (!Number.isFinite(n)) {
            return res.status(400).json({ message: 'validation_error', details: [{ field: 'networkId', message: 'invalid' }] });
        }
        next.networkId = n;
    }
    const updated = await (0, usersService_1.updateUser)(id, next);
    if (!updated)
        return res.status(404).json({ message: 'not_found' });
    return res.json(updated);
}
