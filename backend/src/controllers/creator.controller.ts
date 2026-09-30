import { Response, NextFunction } from 'express';
import { CreatorService } from '../services/creator.service.js';
import { ApiResponse } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';

export class CreatorController {
  static async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const data = await CreatorService.getDashboardSummary(req.user.userId);
      return ApiResponse.success(res, data);
    } catch (error) {
      next(error);
    }
  }

  static async getProducts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const products = await CreatorService.getCreatorProducts(req.user.userId);
      return ApiResponse.success(res, products);
    } catch (error) {
      next(error);
    }
  }

  static async getProductCustomers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const productId = req.params.id as string;
      const customers = await CreatorService.getProductCustomers(productId, req.user.userId);
      return ApiResponse.success(res, customers);
    } catch (error) {
      next(error);
    }
  }

  static async getOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const orders = await CreatorService.getCreatorOrders(req.user.userId);
      return ApiResponse.success(res, orders);
    } catch (error) {
      next(error);
    }
  }

  static async getAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const analytics = await CreatorService.getCreatorAnalytics(req.user.userId);
      return ApiResponse.success(res, analytics);
    } catch (error) {
      next(error);
    }
  }
}
