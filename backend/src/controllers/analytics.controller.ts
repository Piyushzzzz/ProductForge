import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service.js';
import { ApiResponse } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';

export class AnalyticsController {
  static async record(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { productId, eventType, metadata } = req.body;
      if (!eventType) return ApiResponse.error(res, 'eventType is required.', 400);

      // SECURITY: Only permit known event types to prevent fake stat injection.
      const ALLOWED_EVENTS = ['PRODUCT_VIEW', 'PRODUCT_PURCHASE', 'PRODUCT_DOWNLOAD'] as const;
      if (!ALLOWED_EVENTS.includes(eventType)) {
        return ApiResponse.error(res, `Invalid eventType. Allowed: ${ALLOWED_EVENTS.join(', ')}`, 400, 'INVALID_EVENT_TYPE');
      }

      const event = await AnalyticsService.recordEvent({
        productId,
        userId: req.user?.userId,
        eventType,
        metadata
      });
      ApiResponse.success(res, event, 'Event logged.', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getCreatorSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const summary = await AnalyticsService.getCreatorSummary(req.user.userId);
      ApiResponse.success(res, summary);
    } catch (error) {
      next(error);
    }
  }

  static async getAdminOverview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return ApiResponse.error(res, 'Forbidden: Admin access required.', 403);
      }
      const overview = await AnalyticsService.getAdminOverview();
      ApiResponse.success(res, overview);
    } catch (error) {
      next(error);
    }
  }
}
