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

      const downloadInfo = await FileService.getProtectedFileDownload(
        fileId,
        req.user.userId,
        isAdmin
      );

      if (downloadInfo.isExternalUrl && downloadInfo.downloadUrl) {
        return res.redirect(downloadInfo.downloadUrl);
      }

      res.setHeader('Content-Disposition', `attachment; filename="${downloadInfo.fileName}"`);
      res.setHeader('Content-Type', downloadInfo.mimeType || 'application/octet-stream');
      res.sendFile(downloadInfo.filePath!);
    } catch (error) {
      next(error);
    }
  }
}
