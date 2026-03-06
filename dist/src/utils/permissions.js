"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
const auth_1 = require("./auth");
function requireRole(roles) {
    return async (req, res, next) => {
        const user = await (0, auth_1.getCurrentUser)(req);
        req.user = user;
        if (!roles.includes(user.role)) {
            return res.status(403).json({ message: 'forbidden' });
        }
        return next();
    };
}
