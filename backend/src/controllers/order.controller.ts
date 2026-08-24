import { Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service.js';
import { ApiResponse } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';

export class OrderController {
  static async checkout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const { productId, pricingPlanId } = req.body;
      if (!productId || !pricingPlanId) {
        ApiResponse.error(res, 'productId and pricingPlanId are required.', 400);
        return;
      }
      const result = await OrderService.createOrderAndCheckout(req.user.userId, {
        productId,
        pricingPlanId
      });
      ApiResponse.success(res, result, 'Order placed and license entitlement activated.', 201);
    } catch (error) {
      next(error);
    }
  }

  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const orders = await OrderService.getCustomerOrders(req.user.userId);
      ApiResponse.success(res, orders);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const id = req.params.id as string;
      const isAdmin = req.user.role === 'ADMIN';
      const order = await OrderService.getOrderById(id, req.user.userId, isAdmin);
      ApiResponse.success(res, order);
    } catch (error) {
      next(error);
    }
  }
}
