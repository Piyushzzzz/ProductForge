import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types/index.js';
import { verifyToken } from '../utils/token.js';
import { ApiResponse } from '../utils/response.js';

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ApiResponse.error(res, 'Authentication token missing or invalid.', 401, 'UNAUTHORIZED');
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    ApiResponse.error(res, 'Session expired or token invalid. Please log in again.', 401, 'INVALID_TOKEN');
    return;
  }
};

export const optionalAuth = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const payload = verifyToken(token);
      req.user = payload;
    } catch {
      // Ignore invalid token for optional auth
    }
  }
  next();
};
