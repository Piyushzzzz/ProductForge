import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name, role, avatarUrl } = req.body;
      if (!email || !password || !name) {
        ApiResponse.error(res, 'Name, email, and password are required fields.', 400, 'VALIDATION_ERROR');
        return;
      }

      // SECURITY: Never allow self-assignment of ADMIN role via API.
      // Only CUSTOMER and CREATOR are permitted on the public registration endpoint.
      const safeRole = role === 'CREATOR' ? 'CREATOR' : 'CUSTOMER';

      const result = await AuthService.register({ email, password, name, role: safeRole, avatarUrl });
      ApiResponse.success(res, result, 'Registration successful.', 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        ApiResponse.error(res, 'Email and password are required.', 400, 'VALIDATION_ERROR');
        return;
      }
      const result = await AuthService.login({ email, password });
      ApiResponse.success(res, result, 'Login successful.');
    } catch (error) {
      next(error);
    }
  }

  static async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        ApiResponse.error(res, 'Unauthorized', 401);
        return;
      }
      const user = await AuthService.getCurrentUser(req.user.userId);
      ApiResponse.success(res, user);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        ApiResponse.error(res, 'Unauthorized', 401);
        return;
      }
      const updated = await AuthService.updateProfile(req.user.userId, req.body);
      ApiResponse.success(res, updated, 'Profile updated successfully.');
    } catch (error) {
      next(error);
    }
  }
}
