import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

router.get('/my-products', requireAuth, requireRole(['CREATOR', 'ADMIN']), ProductController.getMyProducts);
router.post('/', requireAuth, requireRole(['CREATOR', 'ADMIN']), ProductController.create);
router.get('/:id', ProductController.getById);
router.put('/:id', requireAuth, requireRole(['CREATOR', 'ADMIN']), ProductController.update);
router.patch('/:id/status', requireAuth, requireRole(['CREATOR', 'ADMIN']), ProductController.updateStatus);
router.delete('/:id', requireAuth, requireRole(['CREATOR', 'ADMIN']), ProductController.delete);

export default router;
