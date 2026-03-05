import type { Request, Response } from 'express';

import { getDashboard } from '../services/dashboardService';

export async function get(req: Request, res: Response) {
  const networkIdRaw = typeof req.query.networkId === 'string' ? Number(req.query.networkId) : undefined;
  const networkId = networkIdRaw !== undefined && Number.isFinite(networkIdRaw) ? networkIdRaw : undefined;

  const result = await getDashboard({ networkId });
  res.json(result);
}
