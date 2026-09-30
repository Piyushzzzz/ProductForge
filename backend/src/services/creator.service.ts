import { prisma } from '../config/db.js';

export class CreatorService {
  static async getDashboardSummary(userId: string) {
    const products = await prisma.product.findMany({
      where: { creatorId: userId },
      select: {
        id: true,
        title: true,
        status: true,
        totalPurchases: true,
        createdAt: true,
        pricingPlans: {
          select: { price: true }
        }
      }
    });

    const totalProducts = products.length;
    const publishedProducts = products.filter((p: { status: string }) => p.status === 'PUBLISHED').length;

    const productIds = products.map((p: { id: string }) => p.id);

    // Entitlements / Customers
    const totalCustomers = await prisma.entitlement.count({
      where: { productId: { in: productIds } }
    });

    // Orders featuring creator's products
    const orderItems = await prisma.orderItem.findMany({
      where: { productId: { in: productIds } },
      select: { price: true, createdAt: true, orderId: true }
    });

    const totalOrders = orderItems.length;
    const totalRevenue = orderItems.reduce((sum: number, item: { price: number }) => sum + item.price, 0);

    // Downloads
    const downloadsCount = await prisma.analyticsEvent.count({
      where: {
        productId: { in: productIds },
        eventType: 'PRODUCT_DOWNLOAD'
      }
    });

    // Recent orders
    const recentOrders = await prisma.orderItem.findMany({
      where: { productId: { in: productIds } },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, title: true } },
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            createdAt: true,
            customer: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

    return {
      summary: {
        totalProducts,
        publishedProducts,
        totalCustomers,
        totalOrders,
        totalRevenue,
        totalDownloads: downloadsCount
      },
      recentOrders: recentOrders.map((item: any) => ({
        id: item.order.id,
        orderNumber: item.order.orderNumber,
        productName: item.product.title,
        customerName: item.order.customer.name,
        customerEmail: item.order.customer.email,
        price: item.price,
        status: item.order.status,
        createdAt: item.order.createdAt
      }))
    };
  }

  static async getCreatorProducts(userId: string) {
    return await prisma.product.findMany({
      where: { creatorId: userId },
      include: {
        category: true,
        pricingPlans: true,
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: {
          select: {
            entitlements: true,
            orderItems: true,
            reviews: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  static async getProductCustomers(productId: string, userId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { creatorId: true, title: true }
    });

    if (!product) throw new Error('Product not found.');
    if (product.creatorId !== userId) throw new Error('Unauthorized');

    const entitlements = await prisma.entitlement.findMany({
      where: { productId },
      include: {
        customer: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        orderItem: {
          include: {
            pricingPlan: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return entitlements.map((e: any) => ({
      id: e.id,
      customerName: e.customer.name,
      customerEmail: e.customer.email,
      avatarUrl: e.customer.avatarUrl,
      licenseKey: e.licenseKey,
      status: e.status,
      planName: e.orderItem?.pricingPlan?.name || 'Standard',
      joinedAt: e.createdAt
    }));
  }

  static async getCreatorOrders(userId: string) {
    const creatorProducts = await prisma.product.findMany({
      where: { creatorId: userId },
      select: { id: true }
    });

    const productIds = creatorProducts.map((p: { id: string }) => p.id);

    const orderItems = await prisma.orderItem.findMany({
      where: { productId: { in: productIds } },
      include: {
        product: { select: { id: true, title: true, slug: true } },
        pricingPlan: { select: { name: true, type: true } },
        order: {
          include: {
            customer: { select: { id: true, name: true, email: true } },
            payment: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return orderItems.map((item: any) => ({
      orderItemId: item.id,
      orderId: item.order.id,
      orderNumber: item.order.orderNumber,
      productTitle: item.product.title,
      productSlug: item.product.slug,
      planName: item.pricingPlan.name,
      amount: item.price,
      status: item.order.status,
      paymentProvider: item.order.payment?.provider || 'SANDBOX',
      customerName: item.order.customer.name,
      customerEmail: item.order.customer.email,
      createdAt: item.order.createdAt
    }));
  }

  static async getCreatorAnalytics(userId: string) {
    const products = await prisma.product.findMany({
      where: { creatorId: userId },
      select: { id: true, title: true, slug: true }
    });

    const productIds = products.map((p: { id: string }) => p.id);

    const views = await prisma.analyticsEvent.count({
      where: { productId: { in: productIds }, eventType: 'PRODUCT_VIEW' }
    });

    const downloads = await prisma.analyticsEvent.count({
      where: { productId: { in: productIds }, eventType: 'PRODUCT_DOWNLOAD' }
    });

    const orders = await prisma.orderItem.findMany({
      where: { productId: { in: productIds } },
      select: { price: true, productId: true }
    });

    const totalRevenue = orders.reduce((sum: number, o: { price: number }) => sum + o.price, 0);
    const totalPurchases = orders.length;

    const conversionRate = views > 0 ? ((totalPurchases / views) * 100).toFixed(2) : '0.00';

    const productBreakdown = await Promise.all(
      products.map(async (p: { id: string; title: string; slug: string }) => {
        const pViews = await prisma.analyticsEvent.count({
          where: { productId: p.id, eventType: 'PRODUCT_VIEW' }
        });

        const pDownloads = await prisma.analyticsEvent.count({
          where: { productId: p.id, eventType: 'PRODUCT_DOWNLOAD' }
        });

        const pOrders = orders.filter((o: { productId: string }) => o.productId === p.id);
        const pRevenue = pOrders.reduce((s: number, o: { price: number }) => s + o.price, 0);

        return {
          productId: p.id,
          title: p.title,
          slug: p.slug,
          views: pViews,
          purchases: pOrders.length,
          downloads: pDownloads,
          revenue: pRevenue
        };
      })
    );

    return {
      overview: {
        views,
        downloads,
        purchases: totalPurchases,
        revenue: totalRevenue,
        conversionRate: `${conversionRate}%`
      },
      productBreakdown
    };
  }
}
