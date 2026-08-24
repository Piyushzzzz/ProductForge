import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types/index.js';
import { ApiResponse } from '../utils/response.js';

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required.', 401, 'UNAUTHORIZED');
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      ApiResponse.error(
        res,
        `Access denied. Allowed roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role}`,
        403,
        'FORBIDDEN'
      );
      return;
    }

    next();
  };
};
