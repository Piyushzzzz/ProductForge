import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/category.service.js';
import { ApiResponse } from '../utils/response.js';

export class CategoryController {
  static async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await CategoryService.getAll();
      return ApiResponse.success(res, categories);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoryService.getById(req.params.id as string);
      return ApiResponse.success(res, category);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, slug, icon, description } = req.body;
      if (!name || typeof name !== 'string' || !name.trim()) {
        return ApiResponse.error(res, 'Category name is required.', 400);
      }
      const category = await CategoryService.create({ name, slug, icon, description });
      return ApiResponse.success(res, category, 'Marketplace category created successfully.', 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoryService.update(req.params.id as string, req.body);
      return ApiResponse.success(res, category, 'Category updated successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CategoryService.delete(req.params.id as string);
      return ApiResponse.success(res, result, 'Category deleted successfully.');
    } catch (error) {
      next(error);
    }
  }
}
