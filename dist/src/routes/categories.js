"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const permissions_1 = require("../utils/permissions");
const validate_1 = require("../utils/validate");
const permissions_2 = require("../types/permissions");
const categoriesController = __importStar(require("../controllers/categoriesController"));
const router = (0, express_1.Router)();
router.get('/', categoriesController.list);
router.get('/:id', categoriesController.getById);
router.post('/', validate_1.validateRequest, (0, permissions_1.requireRole)([permissions_2.Role.ADMIN, permissions_2.Role.EDITOR]), categoriesController.create);
router.put('/:id', validate_1.validateRequest, (0, permissions_1.requireRole)([permissions_2.Role.ADMIN, permissions_2.Role.EDITOR]), categoriesController.update);
router.delete('/:id', (0, permissions_1.requireRole)([permissions_2.Role.ADMIN]), categoriesController.remove);
exports.default = router;
