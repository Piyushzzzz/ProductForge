import { Router } from 'express';
import { MarketplaceController } from '../controllers/marketplace.controller.js';

const router = Router();

router.get('/products', MarketplaceController.list);
router.get('/products/:slug', MarketplaceController.getBySlug);
router.get('/categories', MarketplaceController.listCategories);

export default router;
