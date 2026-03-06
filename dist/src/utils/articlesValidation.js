"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCreateArticle = validateCreateArticle;
exports.validateUpdateArticle = validateUpdateArticle;
exports.validatePatchStatus = validatePatchStatus;
exports.validateNotify = validateNotify;
const validation_1 = require("./validation");
function isStatus(v) {
    return v === 'draft' || v === 'published' || v === 'archived';
}
function parseNumberArray(v) {
    if (!Array.isArray(v))
        return null;
    const nums = v.map((x) => Number(x)).filter((n) => !Number.isNaN(n));
    return nums.length === v.length ? nums : null;
}
function validateCreateArticle(body) {
    const errors = [];
    const title = typeof body?.title === 'string' ? body.title : '';
    const content = typeof body?.content === 'string' ? body.content : '';
    const networkId = Number(body?.networkId);
    const authorId = Number(body?.authorId);
    const categoryIds = parseNumberArray(body?.categoryIds) ?? [];
    if (!(0, validation_1.minLength)(title, 5))
        errors.push({ field: 'title', message: 'min_5' });
    if (!(0, validation_1.minLength)(content, 50))
        errors.push({ field: 'content', message: 'min_50' });
    if (!Number.isFinite(networkId))
        errors.push({ field: 'networkId', message: 'required' });
    if (!Number.isFinite(authorId))
        errors.push({ field: 'authorId', message: 'required' });
    if (!categoryIds.length)
        errors.push({ field: 'categoryIds', message: 'min_1' });
    const status = isStatus(body?.status) ? body.status : 'draft';
    const featured = Boolean(body?.featured);
    if (errors.length)
        return { ok: false, errors };
    return {
        ok: true,
        data: {
            title,
            content,
            status,
            featured,
            publishedAt: body?.publishedAt ? new Date(body.publishedAt) : null,
            networkId,
            authorId,
            categoryIds,
        },
    };
}
function validateUpdateArticle(body) {
    const errors = [];
    const data = {};
    if (body?.title !== undefined) {
        if (typeof body.title !== 'string' || !(0, validation_1.minLength)(body.title, 5)) {
            errors.push({ field: 'title', message: 'min_5' });
        }
        else {
            data.title = body.title;
        }
    }
    if (body?.content !== undefined) {
        if (typeof body.content !== 'string' || !(0, validation_1.minLength)(body.content, 50)) {
            errors.push({ field: 'content', message: 'min_50' });
        }
        else {
            data.content = body.content;
        }
    }
    if (body?.status !== undefined) {
        if (!isStatus(body.status)) {
            errors.push({ field: 'status', message: 'invalid' });
        }
        else {
            data.status = body.status;
        }
    }
    if (body?.featured !== undefined) {
        data.featured = Boolean(body.featured);
    }
    if (body?.publishedAt !== undefined) {
        data.publishedAt = body.publishedAt ? new Date(body.publishedAt) : null;
    }
    if (body?.networkId !== undefined) {
        const networkId = Number(body.networkId);
        if (!Number.isFinite(networkId))
            errors.push({ field: 'networkId', message: 'required' });
        else
            data.networkId = networkId;
    }
    if (body?.authorId !== undefined) {
        const authorId = Number(body.authorId);
        if (!Number.isFinite(authorId))
            errors.push({ field: 'authorId', message: 'required' });
        else
            data.authorId = authorId;
    }
    if (body?.categoryIds !== undefined) {
        const categoryIds = parseNumberArray(body.categoryIds);
        if (!categoryIds || !categoryIds.length)
            errors.push({ field: 'categoryIds', message: 'min_1' });
        else
            data.categoryIds = categoryIds;
    }
    if (errors.length)
        return { ok: false, errors };
    return { ok: true, data };
}
function validatePatchStatus(body) {
    const errors = [];
    if (!isStatus(body?.status)) {
        errors.push({ field: 'status', message: 'invalid' });
    }
    if (errors.length)
        return { ok: false, errors };
    return { ok: true, data: { status: body.status } };
}
function validateNotify(body) {
    const errors = [];
    const type = body?.type === 'update' ? 'update' : body?.type === 'new_article' ? 'new_article' : null;
    const recipients = Array.isArray(body?.recipients)
        ? body.recipients.filter((r) => typeof r === 'string' && r.includes('@'))
        : [];
    if (!recipients.length)
        errors.push({ field: 'recipients', message: 'min_1' });
    if (!type)
        errors.push({ field: 'type', message: 'invalid' });
    if (errors.length)
        return { ok: false, errors };
    // At this point, type is non-null.
    const safeType = type;
    return {
        ok: true,
        data: {
            recipients,
            type: safeType,
            subject: typeof body?.subject === 'string' ? body.subject : undefined,
        },
    };
}
