import { Router } from 'express';

import articlesRouter from './articles';
import categoriesRouter from './categories';
import networksRouter from './networks';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/articles', articlesRouter);
router.use('/categories', categoriesRouter);
router.use('/networks', networksRouter);

export default router;
