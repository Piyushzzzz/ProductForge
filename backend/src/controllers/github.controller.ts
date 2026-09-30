import { Response, NextFunction } from 'express';
import { GitHubService } from '../services/github.service.js';
import { ApiResponse } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';

export class GitHubController {
  static getConnectUrl(req: AuthenticatedRequest, res: Response) {
    const state = (req.query.state as string) || 'productforge';
    const url = GitHubService.getConnectUrl(state);
    return ApiResponse.success(res, { url });
  }

  static async handleCallback(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const { code } = req.query;
      if (!code || typeof code !== 'string') {
        return ApiResponse.error(res, 'Authorization code missing in callback query.', 400);
      }
      const connection = await GitHubService.handleCallback(req.user.userId, code);
      return ApiResponse.success(res, connection, 'GitHub connected successfully.');
    } catch (error: any) {
      next(error);
    }
  }

  static async savePersonalToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const { accessToken, username } = req.body;
      if (!accessToken) {
        return ApiResponse.error(res, 'Access token is required.', 400);
      }
      const connection = await GitHubService.saveConnection(req.user.userId, accessToken, username);
      return ApiResponse.success(res, connection, 'GitHub token saved successfully.');
    } catch (error: any) {
      next(error);
    }
  }

  static async getStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const status = await GitHubService.getConnectionStatus(req.user.userId);
      return ApiResponse.success(res, status);
    } catch (error: any) {
      next(error);
    }
  }

  static async disconnectAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      await GitHubService.disconnectUser(req.user.userId);
      return ApiResponse.success(res, null, 'GitHub connection removed.');
    } catch (error: any) {
      next(error);
    }
  }

  static async getRepositories(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const repos = await GitHubService.getUserRepositories(req.user.userId);
      return ApiResponse.success(res, repos);
    } catch (error: any) {
      next(error);
    }
  }

  static async connectProductRepo(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const productId = req.params.productId as string;
      const { repoId, owner, repoName, url, defaultBranch } = req.body;

      if (!owner || !repoName) {
        return ApiResponse.error(res, 'Owner and repoName are required.', 400);
      }

      const updatedProduct = await GitHubService.connectProductToRepo(productId, {
        repoId,
        owner,
        repoName,
        url,
        defaultBranch
      });

      return ApiResponse.success(res, updatedProduct, 'Repository connected to product.');
    } catch (error: any) {
      next(error);
    }
  }

  static async disconnectProductRepo(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const productId = req.params.productId as string;
      const updatedProduct = await GitHubService.disconnectProductRepo(productId);
      return ApiResponse.success(res, updatedProduct, 'Repository disconnected from product.');
    } catch (error: any) {
      next(error);
    }
  }

  static async getProductReleases(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const productId = req.params.productId as string;
      const releases = await GitHubService.getRepoReleases(productId, req.user.userId);
      return ApiResponse.success(res, releases);
    } catch (error: any) {
      next(error);
    }
  }

  static async syncProductReleases(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const productId = req.params.productId as string;
      const result = await GitHubService.syncReleases(productId, req.user.userId);
      return ApiResponse.success(res, result, `Synchronized ${result.syncedCount} releases from GitHub.`);
    } catch (error: any) {
      next(error);
    }
  }
}
