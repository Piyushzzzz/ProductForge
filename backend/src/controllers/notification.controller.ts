import { Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service.js';
import { ApiResponse } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';

export class NotificationController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const notifications = await NotificationService.getUserNotifications(req.user.userId);
      ApiResponse.success(res, notifications);
    } catch (error) {
      next(error);
    }
  }

  static async markRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const id = req.params.id as string;
      await NotificationService.markAsRead(id, req.user.userId);
      ApiResponse.success(res, { success: true });
    } catch (error) {
      next(error);
    }
  }

  static async markAllRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      await NotificationService.markAllAsRead(req.user.userId);
      ApiResponse.success(res, { success: true });
    } catch (error) {
      next(error);
    }
  }
}
