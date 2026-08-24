import { Response } from 'express';

export class ApiResponse {
  static success<T>(res: Response, data: T, message?: string, statusCode: number = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  static error(res: Response, message: string, statusCode: number = 500, errorCode?: string, details?: any) {
    return res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode || 'INTERNAL_ERROR',
        message,
        details
      }
    });
  }
}
