import { prisma } from '../config/db.js';
import { CategoryService } from './category.service.js';

export class MarketplaceService {
  static async getProducts(filters: {
    category?: string;
    search?: string;
    sortBy?: 'popular' | 'newest' | 'rating' | 'price_asc' | 'price_desc';
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(50, filters.limit || 12);
    const skip = (page - 1) * limit;

    const AND: any[] = [
      { status: { in: ['PUBLISHED', 'BETA'] } }
    ];

    if (filters.category && filters.category !== 'all' && filters.category.trim()) {
      const catQuery = filters.category.trim();
      AND.push({
        OR: [
          { categoryId: catQuery },
          { category: { slug: catQuery } },
          { category: { name: { contains: catQuery } } }
        ]
      });
    }

    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim();
      AND.push({
        OR: [
          { title: { contains: q } },
          { tagline: { contains: q } },
          { description: { contains: q } }
        ]
      });
    }

    const where: any = { AND };

    let orderBy: any = { createdAt: 'desc' };
    if (filters.sortBy === 'popular') orderBy = { totalPurchases: 'desc' };
    if (filters.sortBy === 'rating') orderBy = { averageRating: 'desc' };
    if (filters.sortBy === 'newest') orderBy = { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          creator: {
            select: { id: true, name: true, avatarUrl: true }
          },
          pricingPlans: true,
          versions: {
            where: { isCurrent: true },
            take: 1
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getProductBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        creator: {
          select: { id: true, name: true, avatarUrl: true, creatorProfile: true }
        },
        pricingPlans: true,
        versions: {
          orderBy: { publishedAt: 'desc' },
          include: { files: true }
        },
        reviews: {
          include: {
            customer: { select: { id: true, name: true, avatarUrl: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!product) {
      throw { statusCode: 404, message: 'Product not found in marketplace.' };
    }

    // Telemetry log (async view event)
    try {
      await prisma.analyticsEvent.create({
        data: {
          productId: product.id,
          eventType: 'PRODUCT_VIEW'
        }
      });
    } catch {
      // Ignore background analytics logging errors
    }

    return product;
  }

  static async getCategories() {
    return CategoryService.getAll();
  }
}
