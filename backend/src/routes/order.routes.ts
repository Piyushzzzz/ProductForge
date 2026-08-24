import { Router } from 'express';
import { OrderController } from '../controllers/order.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/checkout', requireAuth, OrderController.checkout);
router.get('/my-orders', requireAuth, OrderController.list);
router.get('/:id', requireAuth, OrderController.getById);

export default router;
