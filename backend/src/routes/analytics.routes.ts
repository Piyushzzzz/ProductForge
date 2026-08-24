import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { optionalAuth, requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

router.post('/event', optionalAuth, AnalyticsController.record);
router.get('/creator/summary', requireAuth, requireRole(['CREATOR', 'ADMIN']), AnalyticsController.getCreatorSummary);
router.get('/admin/overview', requireAuth, requireRole(['ADMIN']), AnalyticsController.getAdminOverview);

export default router;
