"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCreateCategory = validateCreateCategory;
exports.validateUpdateCategory = validateUpdateCategory;
const validation_1 = require("./validation");
function isFiniteNumber(v) {
    return typeof v === 'number' && Number.isFinite(v);
}
function validateCreateCategory(body) {
    const errors = [];
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const networkIdRaw = typeof body.networkId === 'number' ? body.networkId : Number(body.networkId);
    const networkId = isFiniteNumber(networkIdRaw) ? networkIdRaw : NaN;
    if (!(0, validation_1.minLength)(name, 2))
        errors.push({ field: 'name', message: 'name_min_2' });
    if (!(0, validation_1.minLength)(description, 2))
        errors.push({ field: 'description', message: 'description_min_2' });
    if (!Number.isFinite(networkId))
        errors.push({ field: 'networkId', message: 'networkId_required' });
    if (errors.length)
        return { ok: false, errors };
    return { ok: true, data: { name, description, networkId } };
}
function validateUpdateCategory(body) {
    const errors = [];
    const name = body.name === undefined ? undefined : typeof body.name === 'string' ? body.name.trim() : null;
    const description = body.description === undefined ? undefined : typeof body.description === 'string' ? body.description.trim() : null;
    const networkId = body.networkId === undefined ? undefined : Number(body.networkId);
    if (name === null || (name !== undefined && !(0, validation_1.minLength)(name, 2)))
        errors.push({ field: 'name', message: 'name_min_2' });
    if (description === null || (description !== undefined && !(0, validation_1.minLength)(description, 2)))
        errors.push({ field: 'description', message: 'description_min_2' });
    if (networkId !== undefined && !Number.isFinite(networkId))
        errors.push({ field: 'networkId', message: 'networkId_invalid' });
    if (errors.length)
        return { ok: false, errors };
    return { ok: true, data: { name: name ?? undefined, description: description ?? undefined, networkId } };
}
