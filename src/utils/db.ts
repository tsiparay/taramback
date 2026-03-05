import path from 'path';
import sqlite3 from 'sqlite3';

const dbPath = process.env.SQLITE_PATH ?? path.join(process.cwd(), 'data.sqlite');

export const db = new sqlite3.Database(dbPath);

export function all<T>(sql: string, params: unknown[] = []) {
  return new Promise<T[]>((resolve, reject) => {
    db.all(sql, params as any, (err, rows) => {
      if (err) return reject(err);
      resolve(rows as T[]);
    });
  });
}

export function get<T>(sql: string, params: unknown[] = []) {
  return new Promise<T | undefined>((resolve, reject) => {
    db.get(sql, params as any, (err, row) => {
      if (err) return reject(err);
      resolve(row as T | undefined);
    });
  });
}

export function run(sql: string, params: unknown[] = []) {
  return new Promise<void>((resolve, reject) => {
    db.run(sql, params as any, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}
