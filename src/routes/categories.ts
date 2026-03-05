import { Router } from 'express';

import { requireRole } from '../utils/permissions';
import { validateRequest } from '../utils/validate';
import { Role } from '../types/permissions';
import * as categoriesController from '../controllers/categoriesController';

const router = Router();

router.get('/', categoriesController.list);
router.get('/:id', categoriesController.getById);

router.post('/', validateRequest, requireRole([Role.ADMIN, Role.EDITOR]), categoriesController.create);
router.put('/:id', validateRequest, requireRole([Role.ADMIN, Role.EDITOR]), categoriesController.update);
router.delete('/:id', requireRole([Role.ADMIN]), categoriesController.remove);

export default router;
