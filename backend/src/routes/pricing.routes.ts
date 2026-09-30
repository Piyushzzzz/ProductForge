import { Router } from 'express';
import { PricingController } from '../controllers/pricing.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { requireProductOwnership } from '../middleware/creatorOwnership.middleware.js';

const router = Router({ mergeParams: true });

router.get('/', PricingController.getPlans);
router.post('/', requireAuth, requireRole(['CREATOR', 'ADMIN']), requireProductOwnership, PricingController.createPlan);
router.put('/:planId', requireAuth, requireRole(['CREATOR', 'ADMIN']), requireProductOwnership, PricingController.updatePlan);
router.delete('/:planId', requireAuth, requireRole(['CREATOR', 'ADMIN']), requireProductOwnership, PricingController.deletePlan);

export default router;
