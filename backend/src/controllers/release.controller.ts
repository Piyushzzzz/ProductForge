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

  static async compare(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const productId = req.params.id as string;
      const {
        baseVersionId,
        targetVersionId,
        newVersionNumber,
        newReleaseTitle,
        newReleaseNotes,
        newFileSize,
        newFileName
      } = { ...req.query, ...req.body };

      const comparison = await ReleaseService.compareVersions(productId, {
        baseVersionId: baseVersionId as string,
        targetVersionId: targetVersionId as string,
        newVersionNumber: newVersionNumber as string,
        newReleaseTitle: newReleaseTitle as string,
        newReleaseNotes: newReleaseNotes as string,
        newFileSize: newFileSize ? Number(newFileSize) : undefined,
        newFileName: newFileName as string
      });

      ApiResponse.success(res, comparison);
    } catch (error) {
      next(error);
    }
  }

  static async rollback(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const productId = req.params.id as string;
      const { targetVersionId, reason } = req.body;

      if (!targetVersionId) {
        ApiResponse.error(res, 'targetVersionId is required to execute a rollback.', 400);
        return;
      }

      const isAdmin = req.user.role === 'ADMIN';
      const result = await ReleaseService.rollbackRelease(
        productId,
        targetVersionId,
        reason,
        req.user.userId,
        isAdmin
      );

      ApiResponse.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }
}
