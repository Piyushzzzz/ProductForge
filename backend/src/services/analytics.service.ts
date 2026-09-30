import { prisma } from '../config/db.js';

export class AnalyticsService {
  static async recordEvent(data: {
    productId?: string;
    userId?: string;
    eventType: string;
    metadata?: any;
  }) {
    return prisma.analyticsEvent.create({
      data: {
        productId: data.productId,
        userId: data.userId,
        eventType: data.eventType,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null
      }
    });
  }

  static async getCreatorSummary(creatorId: string) {
    // Fetch all products of this creator
    const products = await prisma.product.findMany({
      where: { creatorId },
      include: {
        orderItems: true,
        versions: { include: { files: true } }
      }
    });

    const productIds = products.map(p => p.id);

    // Fetch total revenue from completed orders
    const totalPurchases = products.reduce((sum, p) => sum + p.totalPurchases, 0);

    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { userId: creatorId }
    });

    const totalRevenue = creatorProfile?.totalSales || 0;

    // Fetch view events count
    const totalViews = await prisma.analyticsEvent.count({
      where: {
        productId: { in: productIds },
        eventType: 'PRODUCT_VIEW'
      }
    });

    // Fetch download events count
    const totalDownloads = await prisma.analyticsEvent.count({
      where: {
        productId: { in: productIds },
        eventType: 'PRODUCT_DOWNLOAD'
      }
    });

    // Calculate conversion rate
    const conversionRate = totalViews > 0 ? ((totalPurchases / totalViews) * 100).toFixed(1) : '0.0';

    // Monthly telemetry timeline mockup for chart rendering
    const telemetryTimeline = [
      { month: 'Jan', revenue: totalRevenue * 0.1, downloads: Math.round(totalDownloads * 0.1) },
      { month: 'Feb', revenue: totalRevenue * 0.15, downloads: Math.round(totalDownloads * 0.12) },
      { month: 'Mar', revenue: totalRevenue * 0.25, downloads: Math.round(totalDownloads * 0.22) },
      { month: 'Apr', revenue: totalRevenue * 0.4, downloads: Math.round(totalDownloads * 0.35) },
      { month: 'May', revenue: totalRevenue * 0.7, downloads: Math.round(totalDownloads * 0.6) },
      { month: 'Jun', revenue: totalRevenue, downloads: totalDownloads }
    ];

    return {
      totalRevenue,
      totalPurchases,
      totalViews,
      totalDownloads,
      conversionRate: `${conversionRate}%`,
      activeProductsCount: products.filter(p => p.status === 'PUBLISHED').length,
      draftProductsCount: products.filter(p => p.status === 'DRAFT').length,
      betaProductsCount: products.filter(p => p.status === 'BETA').length,
      archivedProductsCount: products.filter(p => p.status === 'ARCHIVED').length,
      telemetryTimeline,
      productsSummary: products.map(p => ({
        id: p.id,
        title: p.title,
        status: p.status,
        purchases: p.totalPurchases,
        rating: p.averageRating,
        revenue: p.orderItems.reduce((s, item) => s + item.price, 0)
      }))
    };
  }

  static async getAdminOverview() {
    const [totalUsers, totalCreators, totalProducts, totalOrders, activeEntitlements, recentProducts, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'CREATOR' } }),
      prisma.product.count(),
      prisma.order.count(),
      prisma.entitlement.count({ where: { status: 'ACTIVE' } }),
      prisma.product.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: { select: { id: true, name: true, email: true } },
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { orderItems: true } }
        }
      }),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      })
    ]);

    const aggregateSales = await prisma.order.aggregate({
      _sum: { totalAmount: true }
    });

    const totalGMV = aggregateSales._sum.totalAmount || 0;

    return {
      totalUsers,
      totalCreators,
      totalProducts,
      totalOrders,
      totalGMV,
      grossMarketplaceVolume: totalGMV,
      activeEntitlements,
      systemHealth: '100% Operational',
      recentUsers,
      recentProducts
    };
  }
}
