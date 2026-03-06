"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importArticlesHandler = importArticlesHandler;
const importService_1 = require("../services/importService");
async function importArticlesHandler(req, res) {
    const body = req.body;
    const items = Array.isArray(body) ? body : Array.isArray(body?.items) ? body.items : null;
    if (!items) {
        return res.status(400).json({ message: 'invalid_payload', details: 'expected array or {items:[]}' });
    }
    const result = await (0, importService_1.importArticles)(items);
    return res.json(result);
}
