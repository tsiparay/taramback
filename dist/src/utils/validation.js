"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.minLength = minLength;
function minLength(value, min) {
    return value.trim().length >= min;
}
