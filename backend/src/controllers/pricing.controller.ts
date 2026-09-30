import { Response, NextFunction } from 'express';
import { PricingService } from '../services/pricing.service.js';
import { ApiResponse } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';

export class PricingController {
  static async getPlans(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const productId = req.params.id as string;
      const plans = await PricingService.getPlansByProduct(productId);
      return ApiResponse.success(res, plans);
    } catch (error) {
      next(error);
    }
  }

  static async createPlan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const productId = req.params.id as string;
      const { name, type, price, interval, features } = req.body;
      if (!name || price === undefined) {
        return ApiResponse.error(res, 'Plan name and price are required.', 400);
      }
      const plan = await PricingService.createPlan(productId, { name, type, price, interval, features });
      return ApiResponse.success(res, plan, 'Pricing plan created successfully.', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updatePlan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const planId = req.params.planId as string;
      const updated = await PricingService.updatePlan(planId, req.body);
      return ApiResponse.success(res, updated, 'Pricing plan updated successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async deletePlan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const planId = req.params.planId as string;
      await PricingService.deletePlan(planId);
      return ApiResponse.success(res, null, 'Pricing plan deleted.');
    } catch (error) {
      next(error);
    }
  }
}
