import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', requireAuth, NotificationController.list);
router.patch('/:id/read', requireAuth, NotificationController.markRead);
router.patch('/read-all', requireAuth, NotificationController.markAllRead);

export default router;
