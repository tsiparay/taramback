import { Router } from 'express';

import articlesRouter from './articles';
import categoriesRouter from './categories';
import networksRouter from './networks';
import notificationsRouter from './notifications';
import * as dashboardController from '../controllers/dashboardController';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/articles', articlesRouter);
router.use('/categories', categoriesRouter);
router.use('/networks', networksRouter);
router.use('/notifications', notificationsRouter);

router.get('/dashboard', dashboardController.get);

export default router;
