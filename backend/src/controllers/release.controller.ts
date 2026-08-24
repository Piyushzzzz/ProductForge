import { Response, NextFunction } from 'express';
import { ReleaseService } from '../services/release.service.js';
import { ApiResponse } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';

export class ReleaseController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const productId = req.params.id as string;
      const { versionNumber, releaseTitle, releaseNotes, changelog, isBeta } = req.body;
      if (!versionNumber || !releaseTitle || !releaseNotes) {
        ApiResponse.error(res, 'versionNumber, releaseTitle, and releaseNotes are required.', 400);
        return;
      }
      const isAdmin = req.user.role === 'ADMIN';
      const release = await ReleaseService.createRelease(productId, req.user.userId, {
        versionNumber,
        releaseTitle,
        releaseNotes,
        changelog: changelog || '',
        isBeta
      }, isAdmin);
      ApiResponse.success(res, release, 'Release published successfully.', 201);
    } catch (error) {
      next(error);
    }
  }

  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const productId = req.params.id as string;
      const releases = await ReleaseService.getReleases(productId);
      ApiResponse.success(res, releases);
    } catch (error) {
      next(error);
    }
  }

  static async uploadFile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const versionId = req.params.versionId as string;
      if (!req.file) {
        ApiResponse.error(res, 'No file uploaded.', 400);
        return;
      }
      const isAdmin = req.user.role === 'ADMIN';
      const productFile = await ReleaseService.attachFile(versionId, req.user.userId, req.file, isAdmin);
      ApiResponse.success(res, productFile, 'Asset file uploaded and attached.', 201);
    } catch (error) {
      next(error);
    }
  }
}
