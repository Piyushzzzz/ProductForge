import { Router } from 'express';
import { ReleaseController } from '../controllers/release.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { uploadMiddleware } from '../config/storage.js';

const router = Router();

router.post('/products/:id/releases', requireAuth, requireRole(['CREATOR', 'ADMIN']), ReleaseController.create);
router.get('/products/:id/releases', ReleaseController.list);
router.post('/releases/:versionId/files', requireAuth, requireRole(['CREATOR', 'ADMIN']), uploadMiddleware.single('file'), ReleaseController.uploadFile);

export default router;
