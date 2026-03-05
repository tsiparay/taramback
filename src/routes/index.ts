import { Router } from 'express';

import articlesRouter from './articles';
import categoriesRouter from './categories';
import networksRouter from './networks';
import notificationsRouter from './notifications';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/articles', articlesRouter);
router.use('/categories', categoriesRouter);
router.use('/networks', networksRouter);
router.use('/notifications', notificationsRouter);

export default router;
