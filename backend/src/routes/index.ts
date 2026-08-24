import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import marketplaceRoutes from './marketplace.routes.js';
import releaseRoutes from './release.routes.js';
import fileRoutes from './file.routes.js';
import orderRoutes from './order.routes.js';
import entitlementRoutes from './entitlement.routes.js';
import reviewRoutes from './review.routes.js';
import analyticsRoutes from './analytics.routes.js';
import notificationRoutes from './notification.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', authRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/marketplace', marketplaceRoutes);
apiRouter.use('/categories', marketplaceRoutes);
apiRouter.use('/releases', releaseRoutes);
apiRouter.use('/files', fileRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/payments', orderRoutes);
apiRouter.use('/entitlements', entitlementRoutes);
apiRouter.use('/reviews', reviewRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/notifications', notificationRoutes);

export default apiRouter;
