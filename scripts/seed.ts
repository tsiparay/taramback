import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';

type SeedNetwork = { id: number; name: string; description: string };
type SeedCategory = { id: number; name: string; description: string; networkId: number };
type SeedUser = { id: number; username: string; email: string; role: 'admin' | 'editor' | 'user'; networkId: number };
type SeedArticle = {
  id: number;
  title: string;
  content: string;
  status: 'draft' | 'published';
  featured: boolean;
  publishedAt: string | null;
  categoryId: number;
  networkId: number;
  authorId: number;
};
type SeedNotification = {
  id: number;
  userId: number;
  articleId: number;
  type: 'new_article' | 'update';
  sentAt: string;
};

type SeedFile = {
  networks: SeedNetwork[];
  categories: SeedCategory[];
  users: SeedUser[];
  articles: SeedArticle[];
  notifications: SeedNotification[];
};

const dbPath = process.env.SQLITE_PATH ?? path.join(process.cwd(), 'data.sqlite');
const seedPath = process.env.SEED_PATH ?? path.join(process.cwd(), 'seed', 'seed.json');

function run(db: sqlite3.Database, sql: string, params: unknown[] = []) {
  return new Promise<void>((resolve, reject) => {
    db.run(sql, params as any, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

async function main() {
  const raw = fs.readFileSync(seedPath, 'utf-8');
  const seed = JSON.parse(raw) as SeedFile;

  const db = new sqlite3.Database(dbPath);

  try {
    await run(db, 'PRAGMA foreign_keys = ON');

    await run(
      db,
      `CREATE TABLE IF NOT EXISTS networks (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL
      )`
    );

    await run(
      db,
      `CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        networkId INTEGER NOT NULL,
        FOREIGN KEY(networkId) REFERENCES networks(id)
      )`
    );

    await run(
      db,
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL,
        networkId INTEGER NOT NULL,
        FOREIGN KEY(networkId) REFERENCES networks(id)
      )`
    );

    await run(
      db,
      `CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        status TEXT NOT NULL,
        featured INTEGER NOT NULL,
        publishedAt TEXT,
        categoryId INTEGER,
        networkId INTEGER NOT NULL,
        authorId INTEGER NOT NULL,
        FOREIGN KEY(categoryId) REFERENCES categories(id),
        FOREIGN KEY(networkId) REFERENCES networks(id),
        FOREIGN KEY(authorId) REFERENCES users(id)
      )`
    );

    await run(
      db,
      `CREATE TABLE IF NOT EXISTS article_categories (
        articleId INTEGER NOT NULL,
        categoryId INTEGER NOT NULL,
        PRIMARY KEY(articleId, categoryId),
        FOREIGN KEY(articleId) REFERENCES articles(id) ON DELETE CASCADE,
        FOREIGN KEY(categoryId) REFERENCES categories(id)
      )`
    );

    // Ensure notifications schema is up-to-date even if an older DB already exists.
    await run(db, 'DROP TABLE IF EXISTS notifications');

    await run(
      db,
      `CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY,
        userId INTEGER NOT NULL,
        articleId INTEGER NOT NULL,
        type TEXT NOT NULL,
        recipientsJson TEXT NOT NULL,
        subject TEXT,
        status TEXT NOT NULL,
        error TEXT,
        sentAt TEXT NOT NULL,
        FOREIGN KEY(userId) REFERENCES users(id),
        FOREIGN KEY(articleId) REFERENCES articles(id)
      )`
    );

    await run(db, 'DELETE FROM notifications');
    await run(db, 'DELETE FROM article_categories');
    await run(db, 'DELETE FROM articles');
    await run(db, 'DELETE FROM users');
    await run(db, 'DELETE FROM categories');
    await run(db, 'DELETE FROM networks');

    for (const n of seed.networks) {
      await run(db, 'INSERT INTO networks (id, name, description) VALUES (?, ?, ?)', [n.id, n.name, n.description]);
    }

    for (const c of seed.categories) {
      await run(db, 'INSERT INTO categories (id, name, description, networkId) VALUES (?, ?, ?, ?)', [
        c.id,
        c.name,
        c.description,
        c.networkId,
      ]);
    }

    for (const u of seed.users) {
      await run(db, 'INSERT INTO users (id, username, email, role, networkId) VALUES (?, ?, ?, ?, ?)', [
        u.id,
        u.username,
        u.email,
        u.role,
        u.networkId,
      ]);
    }

    for (const a of seed.articles) {
      await run(
        db,
        'INSERT INTO articles (id, title, content, status, featured, publishedAt, categoryId, networkId, authorId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          a.id,
          a.title,
          a.content,
          a.status,
          a.featured ? 1 : 0,
          a.publishedAt,
          a.categoryId,
          a.networkId,
          a.authorId,
        ]
      );

      await run(db, 'INSERT INTO article_categories (articleId, categoryId) VALUES (?, ?)', [a.id, a.categoryId]);
    }

    for (const no of seed.notifications) {
      await run(
        db,
        'INSERT INTO notifications (id, userId, articleId, type, recipientsJson, subject, status, error, sentAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          no.id,
          no.userId,
          no.articleId,
          no.type,
          JSON.stringify([]),
          null,
          'sent',
          null,
          no.sentAt,
        ]
      );
    }

    console.log(`Seed OK: ${dbPath}`);
  } finally {
    db.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
