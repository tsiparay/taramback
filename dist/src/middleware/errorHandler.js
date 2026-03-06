"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const httpError_1 = require("../utils/httpError");
function errorHandler(err, req, res, next) {
    if (res.headersSent)
        return next(err);
    if (err instanceof httpError_1.HttpError) {
        return res.status(err.status).json({ message: err.message, details: err.details });
    }
    console.error(err);
    return res.status(500).json({ message: 'internal_error' });
}
