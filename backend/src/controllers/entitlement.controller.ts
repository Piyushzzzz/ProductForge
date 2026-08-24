import { Response, NextFunction } from 'express';
import { EntitlementService } from '../services/entitlement.service.js';
import { ApiResponse } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';

export class EntitlementController {
  static async getMyLibrary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const library = await EntitlementService.getCustomerLibrary(req.user.userId);
      ApiResponse.success(res, library);
    } catch (error) {
      next(error);
    }
  }

  static async verify(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const productId = req.params.productId as string;
      const result = await EntitlementService.verifyProductEntitlement(req.user.userId, productId);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getCreatorCustomers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const customers = await EntitlementService.getCreatorCustomers(req.user.userId);
      ApiResponse.success(res, customers);
    } catch (error) {
      next(error);
    }
  }
}
