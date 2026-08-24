import { Request, Response, NextFunction } from 'express';
import { MarketplaceService } from '../services/marketplace.service.js';
import { ApiResponse } from '../utils/response.js';

export class MarketplaceController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, search, sortBy, page, limit } = req.query;
      const result = await MarketplaceService.getProducts({
        category: category as string,
        search: search as string,
        sortBy: sortBy as any,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 12
      });
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const product = await MarketplaceService.getProductBySlug(slug);
      ApiResponse.success(res, product);
    } catch (error) {
      next(error);
    }
  }

  static async listCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await MarketplaceService.getCategories();
      ApiResponse.success(res, categories);
    } catch (error) {
      next(error);
    }
  }
}
