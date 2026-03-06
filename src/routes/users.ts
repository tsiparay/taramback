import { Router } from 'express';

import { requireRole } from '../utils/permissions';
import { Role } from '../types/permissions';
import { validateRequest } from '../utils/validate';
import * as usersController from '../controllers/usersController';

const router = Router();

router.get('/', requireRole([Role.ADMIN]), usersController.list);
router.get('/:id', requireRole([Role.ADMIN]), usersController.getById);
router.put('/:id', validateRequest, requireRole([Role.ADMIN]), usersController.update);

export default router;
