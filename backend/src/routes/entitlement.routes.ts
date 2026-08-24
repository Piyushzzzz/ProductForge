import { Router } from 'express';
import { EntitlementController } from '../controllers/entitlement.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

router.get('/my-library', requireAuth, EntitlementController.getMyLibrary);
router.get('/verify/:productId', requireAuth, EntitlementController.verify);
router.get('/creator/customers', requireAuth, requireRole(['CREATOR', 'ADMIN']), EntitlementController.getCreatorCustomers);

export default router;
