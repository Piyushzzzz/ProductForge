import { Router } from 'express';
import { FileController } from '../controllers/file.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/:id/download', requireAuth, FileController.download);

export default router;
