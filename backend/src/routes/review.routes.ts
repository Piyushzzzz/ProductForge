import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', requireAuth, ReviewController.create);
router.get('/product/:productId', ReviewController.listByProduct);
router.delete('/:id', requireAuth, ReviewController.delete);

export default router;
