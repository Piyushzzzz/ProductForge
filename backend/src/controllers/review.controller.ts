import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service.js';
import { ApiResponse } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';

export class ReviewController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const { productId, rating, comment } = req.body;
      if (!productId || !rating || !comment) {
        ApiResponse.error(res, 'productId, rating, and comment are required.', 400);
        return;
      }
      const review = await ReviewService.addReview(req.user.userId, {
        productId,
        rating: Number(rating),
        comment
      });
      ApiResponse.success(res, review, 'Review posted successfully.', 201);
    } catch (error) {
      next(error);
    }
  }

  static async listByProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = req.params.productId as string;
      const reviews = await ReviewService.getProductReviews(productId);
      ApiResponse.success(res, reviews);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const id = req.params.id as string;
      const isAdmin = req.user.role === 'ADMIN';
      const result = await ReviewService.deleteReview(id, req.user.userId, isAdmin);
      ApiResponse.success(res, result, 'Review removed.');
    } catch (error) {
      next(error);
    }
  }
}
