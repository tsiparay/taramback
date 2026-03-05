import { Router } from 'express';

import { requireRole } from '../utils/permissions';
import { Role } from '../types/permissions';
import * as importController from '../controllers/importController';

const router = Router();

router.post('/articles', requireRole([Role.ADMIN, Role.EDITOR]), importController.importArticlesHandler);

export default router;
