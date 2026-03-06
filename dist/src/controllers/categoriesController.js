"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = list;
exports.getById = getById;
exports.create = create;
exports.update = update;
exports.remove = remove;
const categoriesValidation_1 = require("../utils/categoriesValidation");
const categoriesService_1 = require("../services/categoriesService");
const permissions_1 = require("../types/permissions");
async function list(req, res) {
    const currentUser = req.user;
    const items = await (0, categoriesService_1.listCategories)();
    if (currentUser && currentUser.role !== permissions_1.Role.ADMIN) {
        return res.json(items.filter((c) => c.networkId === currentUser.networkId));
    }
    return res.json(items);
}
async function getById(req, res) {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
        return res.status(400).json({ message: 'invalid_id' });
    }
    const item = await (0, categoriesService_1.getCategoryById)(id);
    if (!item)
        return res.status(404).json({ message: 'not_found' });
    const currentUser = req.user;
    if (currentUser && currentUser.role !== permissions_1.Role.ADMIN && item.networkId !== currentUser.networkId) {
        return res.status(403).json({ message: 'forbidden' });
    }
    return res.json(item);
}
async function create(req, res) {
    const currentUser = req.user;
    const v = (0, categoriesValidation_1.validateCreateCategory)(req.body ?? {});
    if (!v.ok)
        return res.status(400).json({ message: 'validation_error', details: v.errors });
    if (currentUser && currentUser.role !== permissions_1.Role.ADMIN && v.data.networkId !== currentUser.networkId) {
        return res.status(403).json({ message: 'forbidden' });
    }
    const created = await (0, categoriesService_1.createCategory)(v.data);
    return res.status(201).json(created);
}
async function update(req, res) {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
        return res.status(400).json({ message: 'invalid_id' });
    }
    const v = (0, categoriesValidation_1.validateUpdateCategory)(req.body ?? {});
    if (!v.ok)
        return res.status(400).json({ message: 'validation_error', details: v.errors });
    const currentUser = req.user;
    const existing = await (0, categoriesService_1.getCategoryById)(id);
    if (!existing)
        return res.status(404).json({ message: 'not_found' });
    if (currentUser && currentUser.role !== permissions_1.Role.ADMIN && existing.networkId !== currentUser.networkId) {
        return res.status(403).json({ message: 'forbidden' });
    }
    if (currentUser && currentUser.role !== permissions_1.Role.ADMIN && v.data.networkId !== undefined && v.data.networkId !== currentUser.networkId) {
        return res.status(403).json({ message: 'forbidden' });
    }
    const updated = await (0, categoriesService_1.updateCategory)(id, v.data);
    if (!updated)
        return res.status(404).json({ message: 'not_found' });
    return res.json(updated);
}
async function remove(req, res) {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
        return res.status(400).json({ message: 'invalid_id' });
    }
    const result = await (0, categoriesService_1.deleteCategory)(id);
    if (result === 'not_found')
        return res.status(404).json({ message: 'not_found' });
    if (result === 'in_use')
        return res.status(409).json({ message: 'category_in_use' });
    return res.status(204).send();
}
