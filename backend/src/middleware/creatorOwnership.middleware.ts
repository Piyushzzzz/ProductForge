import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { ApiResponse } from '../utils/response.js';
import { prisma } from '../config/db.js';

export const requireProductOwnership = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required.', 401, 'UNAUTHORIZED');
      return;
    }

    const productId = req.params.productId || req.params.id || req.body.productId;

    if (!productId) {
      ApiResponse.error(res, 'Product ID parameter missing.', 400, 'BAD_REQUEST');
      return;
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, creatorId: true }
    });

    if (!product) {
      ApiResponse.error(res, 'Product not found.', 404, 'NOT_FOUND');
      return;
    }

    if (product.creatorId !== req.user.userId && req.user.role !== 'ADMIN') {
      ApiResponse.error(
        res,
        'Access denied. You do not have permission to manage this product.',
        403,
        'FORBIDDEN'
      );
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
