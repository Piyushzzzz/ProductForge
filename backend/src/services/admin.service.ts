import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';
import { UserRole } from '../types/index.js';

export class AdminService {
  static async getAllUsers(params?: { search?: string; role?: string }) {
    const where: any = {};
    if (params?.role && params.role !== 'ALL') {
      where.role = params.role;
    }
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search } },
        { email: { contains: params.search } }
      ];
    }

    const [users, totalUsers, adminCount, creatorCount, customerCount] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
          _count: {
            select: {
              products: true,
              orders: true,
              entitlements: true
            }
          }
        }
      }),
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'CREATOR' } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } })
    ]);

    return {
      users,
      metrics: {
        totalUsers,
        adminCount,
        creatorCount,
        customerCount
      }
    };
  }

  static async createAdmin(data: { name: string; email: string; password: string }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() }
    });

    if (existing) {
      throw { statusCode: 400, message: 'User with this email already exists.' };
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const newAdmin = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        passwordHash,
        role: 'ADMIN'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    return newAdmin;
  }

  static async updateUserRole(targetUserId: string, newRole: UserRole, currentAdminId: string) {
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!targetUser) {
      throw { statusCode: 404, message: 'User not found.' };
    }

    // Safety guard: if removing ADMIN privileges
    if (targetUser.role === 'ADMIN' && newRole !== 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' }
      });

      if (adminCount <= 1) {
        throw { 
          statusCode: 400, 
          message: 'Security Guard: Cannot demote the last remaining administrator on the platform.' 
        };
      }

      if (targetUser.id === currentAdminId) {
        throw {
          statusCode: 400,
          message: 'Security Guard: You cannot remove your own admin privileges. Another administrator must perform this action.'
        };
      }
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    return updated;
  }

  static async deleteUser(targetUserId: string, currentAdminId: string) {
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!targetUser) {
      throw { statusCode: 404, message: 'User not found.' };
    }

    if (targetUser.id === currentAdminId) {
      throw { statusCode: 400, message: 'Security Guard: You cannot delete your own admin account.' };
    }

    if (targetUser.role === 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      if (adminCount <= 1) {
        throw { statusCode: 400, message: 'Security Guard: Cannot delete the last active administrator.' };
      }
    }

    await prisma.user.delete({
      where: { id: targetUserId }
    });

    return { success: true };
  }

  static async getAllProductsWithFraudAnalysis() {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: { id: true, name: true, email: true, role: true }
        },
        category: {
          select: { id: true, name: true, slug: true }
        },
        pricingPlans: {
          select: { id: true, name: true, price: true, type: true }
        },
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { files: true }
        },
        reviews: {
          select: { rating: true, comment: true }
        },
        _count: {
          select: { orderItems: true, entitlements: true, reviews: true }
        }
      }
    });

    // Run Automated Security & Fraud Heuristics
    const analyzedProducts = products.map(product => {
      const riskFactors: string[] = [];
      let fraudScore = 0;

      // Check 1: Missing GitHub repository
      if (!product.githubRepo && !product.githubUrl) {
        fraudScore += 25;
        riskFactors.push('Unverified source: No GitHub repository linked');
      }

      // Check 2: Missing release binaries or installer files
      const latestVer = product.versions && product.versions.length > 0 ? product.versions[0] : null;
      if (!latestVer || !latestVer.files || latestVer.files.length === 0) {
        fraudScore += 25;
        riskFactors.push('Missing binaries: No software release files attached');
      }

      // Check 3: Pricing anomaly (e.g. price > ₹25,000 without sales or reviews)
      const maxPrice = product.pricingPlans.length > 0 
        ? Math.max(...product.pricingPlans.map(p => p.price)) 
        : 0;
      if (maxPrice >= 25000 && product._count.reviews === 0 && product.totalPurchases === 0) {
        fraudScore += 20;
        riskFactors.push('Anomalous pricing: High-tier pricing with 0 verified reviews');
      }

      // Check 4: Unverified external domain or missing demo
      if (!product.demoUrl) {
        fraudScore += 10;
        riskFactors.push('No live interactive demo endpoint provided');
      } else if (product.demoUrl.includes('localhost') || product.demoUrl.includes('127.0.0.1')) {
        fraudScore += 20;
        riskFactors.push('Suspicious endpoint: Demo URL points to local loopback');
      }

      // Check 5: Poor review trend
      if (product.totalReviews >= 2 && product.averageRating < 2.0) {
        fraudScore += 20;
        riskFactors.push('Customer warning: Average rating below 2.0 stars');
      }

      // Cap score between 0 and 100
      fraudScore = Math.min(100, fraudScore);

      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
      if (fraudScore >= 50) {
        riskLevel = 'HIGH';
      } else if (fraudScore >= 25) {
        riskLevel = 'MEDIUM';
      }

      const isDelisted = product.status === 'ARCHIVED' || product.status === 'UNPUBLISHED';

      return {
        id: product.id,
        title: product.title,
        slug: product.slug,
        status: product.status,
        creator: product.creator,
        category: product.category,
        pricingPlans: product.pricingPlans,
        purchases: product.totalPurchases,
        rating: product.averageRating,
        totalReviews: product.totalReviews,
        createdAt: product.createdAt,
        githubRepo: product.githubRepo,
        demoUrl: product.demoUrl,
        fraudScore,
        riskLevel,
        riskFactors,
        isDelisted
      };
    });

    const highRiskCount = analyzedProducts.filter(p => p.riskLevel === 'HIGH').length;
    const mediumRiskCount = analyzedProducts.filter(p => p.riskLevel === 'MEDIUM').length;

    return {
      products: analyzedProducts,
      stats: {
        totalProducts: products.length,
        highRiskCount,
        mediumRiskCount,
        cleanCount: products.length - highRiskCount - mediumRiskCount
      }
    };
  }

  static async takedownProduct(productId: string, reason?: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { creator: true }
    });

    if (!product) {
      throw { statusCode: 404, message: 'Product not found.' };
    }

    // Set status to ARCHIVED (delisting it from marketplace)
    const updated = await prisma.product.update({
      where: { id: productId },
      data: { status: 'ARCHIVED' }
    });

    // Notify the creator of administrative takedown
    await prisma.notification.create({
      data: {
        userId: product.creatorId,
        title: 'Security Notice: Product Removed by Administrator',
        message: `Your product "${product.title}" has been taken down by platform security administrators. Reason: ${reason || 'Security policy violation / fraud suspicion.'}`,
        type: 'WARNING',
        isRead: false
      }
    });

    // Record Security Audit Event
    await prisma.analyticsEvent.create({
      data: {
        productId,
        eventType: 'PRODUCT_DOWNLOAD', // Using existing event type for telemetry log
        metadata: JSON.stringify({
          action: 'ADMIN_TAKEDOWN',
          reason: reason || 'Fraud / Malicious Takedown',
          timestamp: new Date()
        })
      }
    });

    return updated;
  }

  static async restoreProduct(productId: string) {
    const updated = await prisma.product.update({
      where: { id: productId },
      data: { status: 'PUBLISHED' }
    });
    return updated;
  }
}
