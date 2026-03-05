import { Router } from 'express';

import { requireRole } from '../utils/permissions';
import { Role } from '../types/permissions';
import * as articlesController from '../controllers/articlesController';

const router = Router();

router.get('/', articlesController.list);
router.get('/:id', articlesController.getById);

router.post('/', requireRole([Role.ADMIN, Role.EDITOR]), articlesController.create);
router.put('/:id', requireRole([Role.ADMIN, Role.EDITOR]), articlesController.update);
router.delete('/:id', requireRole([Role.ADMIN]), articlesController.remove);

router.patch('/:id/status', requireRole([Role.ADMIN, Role.EDITOR]), articlesController.patchStatus);
router.post('/:id/notify', requireRole([Role.ADMIN, Role.EDITOR]), articlesController.notify);

export default router;
