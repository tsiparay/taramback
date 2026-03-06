"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.all = all;
exports.get = get;
exports.run = run;
const path_1 = __importDefault(require("path"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const dbPath = process.env.SQLITE_PATH ?? path_1.default.join(process.cwd(), 'data.sqlite');
exports.db = new sqlite3_1.default.Database(dbPath);
function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        exports.db.all(sql, params, (err, rows) => {
            if (err)
                return reject(err);
            resolve(rows);
        });
    });
}
function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        exports.db.get(sql, params, (err, row) => {
            if (err)
                return reject(err);
            resolve(row);
        });
    });
}
function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        exports.db.run(sql, params, (err) => {
            if (err)
                return reject(err);
            resolve();
        });
    });
}
