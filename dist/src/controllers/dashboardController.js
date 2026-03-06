"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = get;
const dashboardService_1 = require("../services/dashboardService");
async function get(req, res) {
    const networkIdRaw = typeof req.query.networkId === 'string' ? Number(req.query.networkId) : undefined;
    const networkId = networkIdRaw !== undefined && Number.isFinite(networkIdRaw) ? networkIdRaw : undefined;
    const result = await (0, dashboardService_1.getDashboard)({ networkId });
    res.json(result);
}
