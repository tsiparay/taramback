"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../utils/db");
const auth_1 = require("../utils/auth");
const permissions_1 = require("../types/permissions");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    const rows = await (0, db_1.all)('SELECT id, name, description FROM networks ORDER BY id ASC');
    const hasUserHeader = Boolean(req.header('x-user-id'));
    if (!hasUserHeader) {
        return res.json(rows);
    }
    const user = await (0, auth_1.getCurrentUser)(req);
    if (user.role !== permissions_1.Role.ADMIN) {
        return res.json(rows.filter((n) => n.id === user.networkId));
    }
    return res.json(rows);
});
exports.default = router;
