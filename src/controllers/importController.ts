import type { Request, Response } from 'express';

import { importArticles } from '../services/importService';

export async function importArticlesHandler(req: Request, res: Response) {
  const body = req.body;
  const items = Array.isArray(body) ? body : Array.isArray(body?.items) ? body.items : null;

  if (!items) {
    return res.status(400).json({ message: 'invalid_payload', details: 'expected array or {items:[]}' });
  }

  const result = await importArticles(items);
  return res.json(result);
}
