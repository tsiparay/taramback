"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = list;
exports.getById = getById;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.patchStatus = patchStatus;
exports.notify = notify;
const articlesValidation_1 = require("../utils/articlesValidation");
const articlesService_1 = require("../services/articlesService");
const permissions_1 = require("../types/permissions");
async function list(req, res) {
    const currentUser = req.user;
    const page = req.query.page ? Number(req.query.page) : undefined;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : undefined;
    const categoryIds = typeof req.query.categoryIds === 'string'
        ? req.query.categoryIds.split(',').map((v) => Number(v)).filter((n) => !Number.isNaN(n))
        : undefined;
    const networkIdRaw = typeof req.query.networkId === 'string' ? Number(req.query.networkId) : undefined;
    const networkId = networkIdRaw !== undefined && Number.isFinite(networkIdRaw) ? networkIdRaw : undefined;
    const effectiveNetworkId = currentUser && currentUser.role !== permissions_1.Role.ADMIN ? currentUser.networkId : networkId;
    const result = await (0, articlesService_1.listArticles)({
        query: typeof req.query.query === 'string' ? req.query.query : undefined,
        status: typeof req.query.status === 'string' ? req.query.status : undefined,
        networkId: effectiveNetworkId,
        featured: typeof req.query.featured === 'string' ? req.query.featured === 'true' : undefined,
        categoryIds,
        page,
        pageSize,
        sort: typeof req.query.sort === 'string' ? req.query.sort : undefined,
        order: typeof req.query.order === 'string' ? req.query.order : undefined,
    });
    res.json(result);
}
async function getById(req, res) {
    const id = Number(req.params.id);
    const article = await (0, articlesService_1.getArticleById)(id);
    if (!article) {
        return res.status(404).json({ message: 'not_found' });
    }
    const currentUser = req.user;
    if (currentUser && currentUser.role !== permissions_1.Role.ADMIN && article.networkId !== currentUser.networkId) {
        return res.status(403).json({ message: 'forbidden' });
    }
    return res.json(article);
}
async function create(req, res) {
    const currentUser = req.user;
    const v = (0, articlesValidation_1.validateCreateArticle)(req.body);
    if (!v.ok) {
        return res.status(400).json({ message: 'validation_error', details: v.errors });
    }
    if (currentUser && currentUser.role !== permissions_1.Role.ADMIN && v.data.networkId !== currentUser.networkId) {
        return res.status(403).json({ message: 'forbidden' });
    }
    const article = await (0, articlesService_1.createArticle)(v.data);
    return res.status(201).json(article);
}
async function update(req, res) {
    const id = Number(req.params.id);
    const currentUser = req.user;
    const existing = await (0, articlesService_1.getArticleById)(id);
    if (!existing) {
        return res.status(404).json({ message: 'not_found' });
    }
    if (currentUser && currentUser.role !== permissions_1.Role.ADMIN && existing.networkId !== currentUser.networkId) {
        return res.status(403).json({ message: 'forbidden' });
    }
    const v = (0, articlesValidation_1.validateUpdateArticle)(req.body);
    if (!v.ok) {
        return res.status(400).json({ message: 'validation_error', details: v.errors });
    }
    if (currentUser && currentUser.role !== permissions_1.Role.ADMIN && v.data.networkId !== undefined && v.data.networkId !== currentUser.networkId) {
        return res.status(403).json({ message: 'forbidden' });
    }
    const article = await (0, articlesService_1.updateArticle)(id, v.data);
    if (!article) {
        return res.status(404).json({ message: 'not_found' });
    }
    return res.json(article);
}
async function remove(req, res) {
    const id = Number(req.params.id);
    const ok = await (0, articlesService_1.deleteArticle)(id);
    if (!ok) {
        return res.status(404).json({ message: 'not_found' });
    }
    return res.status(204).send();
}
async function patchStatus(req, res) {
    const id = Number(req.params.id);
    const currentUser = req.user;
    const existing = await (0, articlesService_1.getArticleById)(id);
    if (!existing) {
        return res.status(404).json({ message: 'not_found' });
    }
    if (currentUser && currentUser.role !== permissions_1.Role.ADMIN && existing.networkId !== currentUser.networkId) {
        return res.status(403).json({ message: 'forbidden' });
    }
    const v = (0, articlesValidation_1.validatePatchStatus)(req.body);
    if (!v.ok) {
        return res.status(400).json({ message: 'validation_error', details: v.errors });
    }
    const article = await (0, articlesService_1.patchArticleStatus)(id, v.data.status);
    if (!article) {
        return res.status(404).json({ message: 'not_found' });
    }
    return res.json(article);
}
async function notify(req, res) {
    const id = Number(req.params.id);
    const currentUser = req.user;
    const existing = await (0, articlesService_1.getArticleById)(id);
    if (!existing) {
        return res.status(404).json({ message: 'not_found' });
    }
    if (currentUser && currentUser.role !== permissions_1.Role.ADMIN && existing.networkId !== currentUser.networkId) {
        return res.status(403).json({ message: 'forbidden' });
    }
    const v = (0, articlesValidation_1.validateNotify)(req.body);
    if (!v.ok) {
        return res.status(400).json({ message: 'validation_error', details: v.errors });
    }
    const result = await (0, articlesService_1.notifyArticle)(id, v.data.type, v.data.recipients, v.data.subject);
    if (!result) {
        return res.status(404).json({ message: 'not_found' });
    }
    return res.json(result);
}
