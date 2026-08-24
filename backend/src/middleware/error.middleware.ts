import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/response.js';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // SECURITY: Log only message and stack — never echo the raw error object
  // (which may contain user-supplied input that was embedded in the error).
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    console.error(`[ERROR] ${err?.message || 'Unknown error'}`);
    if (err?.stack) console.error(err.stack);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  // Only expose stack trace in development mode
  ApiResponse.error(res, message, statusCode, code, !isProduction ? err.stack : undefined);
};
