import { Router } from 'express';
import { MarketplaceController } from '../controllers/marketplace.controller.js';
import { CategoryController } from '../controllers/category.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

router.get('/products', MarketplaceController.list);
router.get('/products/:slug', MarketplaceController.getBySlug);
router.get('/categories', CategoryController.list);
router.post('/categories', requireAuth, requireRole(['CREATOR', 'ADMIN']), CategoryController.create);

export default router;

