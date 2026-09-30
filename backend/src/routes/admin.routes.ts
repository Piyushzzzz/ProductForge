import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// Protect all admin endpoints
router.use(requireAuth, requireRole(['ADMIN']));

// User & Admin Role Management
router.get('/users', AdminController.getUsers);
router.post('/users/create-admin', AdminController.createAdmin);
router.patch('/users/:userId/role', AdminController.updateUserRole);
router.delete('/users/:userId', AdminController.deleteUser);

// Catalog Oversight & Fraud Security Controls
router.get('/products', AdminController.getProducts);
router.post('/products/:productId/takedown', AdminController.takedownProduct);
router.post('/products/:productId/restore', AdminController.restoreProduct);

export default router;
