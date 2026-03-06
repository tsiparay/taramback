import { Router } from 'express';

import articlesRouter from './articles';
import categoriesRouter from './categories';
import networksRouter from './networks';
import notificationsRouter from './notifications';
import importRouter from './import';
import usersRouter from './users';
import * as dashboardController from '../controllers/dashboardController';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/articles', articlesRouter);
router.use('/categories', categoriesRouter);
router.use('/networks', networksRouter);
router.use('/users', usersRouter);
router.use('/notifications', notificationsRouter);
router.use('/import', importRouter);

router.get('/dashboard', dashboardController.get);

export default router;
