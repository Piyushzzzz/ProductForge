import { Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service.js';
import { ApiResponse } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';

export class ProductController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const { title, tagline, description, categoryId, pricingPlans, status, demoUrl, githubRepo, logoUrl, bannerUrl } = req.body;
      if (!title || !tagline || !description || !categoryId) {
        ApiResponse.error(res, 'Title, tagline, description, and categoryId are required.', 400);
        return;
      }
      const product = await ProductService.createProduct(req.user.userId, {
        title,
        tagline,
        description,
        categoryId,
        pricingPlans,
        status,
        demoUrl,
        githubRepo,
        logoUrl,
        bannerUrl
      });
      ApiResponse.success(res, product, 'Product created successfully.', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getMyProducts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const products = await ProductService.getCreatorProducts(req.user.userId);
      ApiResponse.success(res, products);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const product = await ProductService.getProductById(id);
      ApiResponse.success(res, product);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const id = req.params.id as string;
      const isAdmin = req.user.role === 'ADMIN';
      const updated = await ProductService.updateProduct(id, req.user.userId, req.body, isAdmin);
      ApiResponse.success(res, updated, 'Product updated successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const id = req.params.id as string;
      const { status } = req.body;
      if (!status) return ApiResponse.error(res, 'Status is required.', 400);
      const isAdmin = req.user.role === 'ADMIN';
      const updated = await ProductService.updateProductStatus(id, req.user.userId, status, isAdmin);
      ApiResponse.success(res, updated, `Status updated to ${status}.`);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const id = req.params.id as string;
      const isAdmin = req.user.role === 'ADMIN';
      const archived = await ProductService.deleteProduct(id, req.user.userId, isAdmin);
      ApiResponse.success(res, archived, 'Product archived.');
    } catch (error) {
      next(error);
    }
  }
}
