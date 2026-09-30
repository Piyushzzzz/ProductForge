import { Router } from 'express';
import { GitHubController } from '../controllers/github.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { requireProductOwnership } from '../middleware/creatorOwnership.middleware.js';

const router = Router();

// Creator OAuth & Status
router.get('/connect', requireAuth, requireRole(['CREATOR', 'ADMIN']), GitHubController.getConnectUrl);
router.get('/callback', requireAuth, GitHubController.handleCallback);
router.post('/token', requireAuth, requireRole(['CREATOR', 'ADMIN']), GitHubController.savePersonalToken);
router.get('/status', requireAuth, requireRole(['CREATOR', 'ADMIN']), GitHubController.getStatus);
router.delete('/disconnect', requireAuth, requireRole(['CREATOR', 'ADMIN']), GitHubController.disconnectAccount);
router.get('/repositories', requireAuth, requireRole(['CREATOR', 'ADMIN']), GitHubController.getRepositories);

// Product Specific GitHub Connections
router.post('/products/:productId/connect', requireAuth, requireRole(['CREATOR', 'ADMIN']), requireProductOwnership, GitHubController.connectProductRepo);
router.delete('/products/:productId/disconnect', requireAuth, requireRole(['CREATOR', 'ADMIN']), requireProductOwnership, GitHubController.disconnectProductRepo);
router.get('/products/:productId/releases', requireAuth, requireRole(['CREATOR', 'ADMIN']), requireProductOwnership, GitHubController.getProductReleases);
router.post('/products/:productId/sync', requireAuth, requireRole(['CREATOR', 'ADMIN']), requireProductOwnership, GitHubController.syncProductReleases);

export default router;
