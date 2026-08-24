import { prisma } from '../config/db.js';
import { ProductStatus } from '../types/index.js';

export class ProductService {
  static async createProduct(creatorId: string, data: {
    title: string;
    tagline: string;
    description: string;
    categoryId: string;
    demoUrl?: string;
    githubRepo?: string;
    logoUrl?: string;
    bannerUrl?: string;
    status?: ProductStatus;
    pricingPlans?: Array<{
      name: string;
      type: string;
      price: number;
      interval?: string;
      features: string[];
    }>;
  }) {
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);

    const product = await prisma.product.create({
      data: {
        creatorId,
        categoryId: data.categoryId,
        title: data.title,
        slug,
        tagline: data.tagline,
        description: data.description,
        status: data.status || 'DRAFT',
        demoUrl: data.demoUrl,
        githubRepo: data.githubRepo,
        logoUrl: data.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
        bannerUrl: data.bannerUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
        pricingPlans: data.pricingPlans && data.pricingPlans.length > 0 ? {
          create: data.pricingPlans.map(p => ({
            name: p.name,
            type: p.type,
            price: p.price,
            interval: p.interval || 'NONE',
            features: JSON.stringify(p.features)
          }))
        } : {
          create: [{
            name: 'Standard License',
            type: 'ONE_TIME',
            price: 29.0,
            interval: 'NONE',
            features: JSON.stringify(['Full Source Code Access', 'Standard Updates for 1 Year', 'Community Discord Support'])
          }]
        }
      },
      include: {
        category: true,
        pricingPlans: true,
        versions: true
      }
    });

    return product;
  }

  static async getCreatorProducts(creatorId: string) {
    return prisma.product.findMany({
      where: { creatorId },
      include: {
        category: true,
        pricingPlans: true,
        versions: {
          orderBy: { publishedAt: 'desc' },
          include: { files: true }
        },
        _count: {
          select: { orderItems: true, reviews: true, entitlements: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getProductById(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
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
      throw { statusCode: 404, message: 'Product not found.', code: 'PRODUCT_NOT_FOUND' };
    }

    return product;
  }

  static async updateProduct(productId: string, creatorId: string, data: any, isAdmin: boolean = false) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw { statusCode: 404, message: 'Product not found.' };
    }

    if (product.creatorId !== creatorId && !isAdmin) {
      throw { statusCode: 403, message: 'You do not have permission to update this product.' };
    }

    return prisma.product.update({
      where: { id: productId },
      data: {
        title: data.title,
        tagline: data.tagline,
        description: data.description,
        categoryId: data.categoryId,
        status: data.status,
        demoUrl: data.demoUrl,
        githubRepo: data.githubRepo,
        logoUrl: data.logoUrl,
        bannerUrl: data.bannerUrl
      },
      include: {
        category: true,
        pricingPlans: true,
        versions: true
      }
    });
  }

  static async updateProductStatus(productId: string, creatorId: string, status: ProductStatus, isAdmin: boolean = false) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw { statusCode: 404, message: 'Product not found.' };
    }

    if (product.creatorId !== creatorId && !isAdmin) {
      throw { statusCode: 403, message: 'You do not have permission to change status.' };
    }

    return prisma.product.update({
      where: { id: productId },
      data: { status }
    });
  }

  static async deleteProduct(productId: string, creatorId: string, isAdmin: boolean = false) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw { statusCode: 404, message: 'Product not found.' };
    }

    if (product.creatorId !== creatorId && !isAdmin) {
      throw { statusCode: 403, message: 'Unauthorized action.' };
    }

    return prisma.product.update({
      where: { id: productId },
      data: { status: 'ARCHIVED' }
    });
  }
}
