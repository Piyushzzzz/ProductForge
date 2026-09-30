import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// Public: List and view categories
router.get('/', CategoryController.list);
router.get('/:id', CategoryController.getById);

// Creators & Admins can add or modify categories
router.post('/', requireAuth, requireRole(['CREATOR', 'ADMIN']), CategoryController.create);
router.put('/:id', requireAuth, requireRole(['CREATOR', 'ADMIN']), CategoryController.update);

// Only Admins can delete empty categories
router.delete('/:id', requireAuth, requireRole(['ADMIN']), CategoryController.delete);

export default router;
