import { Router } from 'express';
import { CreatorController } from '../controllers/creator.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

router.use(requireAuth, requireRole(['CREATOR', 'ADMIN']));

router.get('/dashboard', CreatorController.getDashboard);
router.get('/products', CreatorController.getProducts);
router.get('/products/:id/customers', CreatorController.getProductCustomers);
router.get('/orders', CreatorController.getOrders);
router.get('/analytics', CreatorController.getAnalytics);

export default router;
