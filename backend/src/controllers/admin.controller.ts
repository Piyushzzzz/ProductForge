import { Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service.js';
import { ApiResponse } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';

export class AdminController {
  static async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { search, role } = req.query as { search?: string; role?: string };
      const data = await AdminService.getAllUsers({ search, role });
      return ApiResponse.success(res, data);
    } catch (error) {
      next(error);
    }
  }

  static async createAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return ApiResponse.error(res, 'Name, email, and password are required.', 400);
      }
      if (password.length < 6) {
        return ApiResponse.error(res, 'Password must be at least 6 characters long.', 400);
      }

      const newAdmin = await AdminService.createAdmin({ name, email, password });
      return ApiResponse.success(res, newAdmin, 'New administrator account created successfully.', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateUserRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const userId = req.params.userId as string;
      const { role } = req.body;

      const validRoles = ['ADMIN', 'CREATOR', 'CUSTOMER'];
      if (!validRoles.includes(role)) {
        return ApiResponse.error(res, `Invalid role. Allowed: ${validRoles.join(', ')}`, 400);
      }

      const updatedUser = await AdminService.updateUserRole(userId, role, req.user.userId);
      return ApiResponse.success(res, updatedUser, `User role successfully changed to ${role}.`);
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const userId = req.params.userId as string;
      await AdminService.deleteUser(userId, req.user.userId);
      return ApiResponse.success(res, null, 'User account deleted.');
    } catch (error) {
      next(error);
    }
  }

  static async getProducts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getAllProductsWithFraudAnalysis();
      return ApiResponse.success(res, data);
    } catch (error) {
      next(error);
    }
  }

  static async takedownProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const productId = req.params.productId as string;
      const { reason } = req.body;
      const updated = await AdminService.takedownProduct(productId, reason);
      return ApiResponse.success(res, updated, 'Product taken down and delisted from marketplace.');
    } catch (error) {
      next(error);
    }
  }

  static async restoreProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const productId = req.params.productId as string;
      const updated = await AdminService.restoreProduct(productId);
      return ApiResponse.success(res, updated, 'Product restored to active marketplace catalog.');
    } catch (error) {
      next(error);
    }
  }
}
