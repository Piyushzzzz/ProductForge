import { Response, NextFunction } from 'express';
import { FileService } from '../services/file.service.js';
import { ApiResponse } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';

export class FileController {
  static async download(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        ApiResponse.error(res, 'Authentication required to download digital products.', 401);
        return;
      }
      const fileId = req.params.id as string;
      const isAdmin = req.user.role === 'ADMIN';

      const { filePath, fileName, mimeType } = await FileService.getProtectedFileDownload(
        fileId,
        req.user.userId,
        isAdmin
      );

      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', mimeType || 'application/octet-stream');
      res.sendFile(filePath);
    } catch (error) {
      next(error);
    }
  }
}
