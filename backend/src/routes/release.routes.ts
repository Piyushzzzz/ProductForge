import { Router } from 'express';
import { ReleaseController } from '../controllers/release.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { uploadMiddleware } from '../config/storage.js';

const router = Router();

// Create release routes (supports both /releases/products/:id and /releases/products/:id/releases)
router.post('/products/:id', requireAuth, requireRole(['CREATOR', 'ADMIN']), ReleaseController.create);
router.post('/products/:id/releases', requireAuth, requireRole(['CREATOR', 'ADMIN']), ReleaseController.create);

// List releases
router.get('/products/:id', ReleaseController.list);
router.get('/products/:id/releases', ReleaseController.list);

// Upload release binary/zip file (supports both /releases/:versionId/upload and /releases/:versionId/files)
router.post('/:versionId/upload', requireAuth, requireRole(['CREATOR', 'ADMIN']), uploadMiddleware.single('file'), ReleaseController.uploadFile);
router.post('/:versionId/files', requireAuth, requireRole(['CREATOR', 'ADMIN']), uploadMiddleware.single('file'), ReleaseController.uploadFile);
router.post('/releases/:versionId/upload', requireAuth, requireRole(['CREATOR', 'ADMIN']), uploadMiddleware.single('file'), ReleaseController.uploadFile);
// Version comparison & diffing
router.get('/products/:id/compare', ReleaseController.compare);
router.post('/products/:id/compare', ReleaseController.compare);

// Version rollback (Creators and Admins)
router.post('/products/:id/rollback', requireAuth, requireRole(['CREATOR', 'ADMIN']), ReleaseController.rollback);

export default router;
