import { prisma } from '../config/db.js';

export class EntitlementService {
  static async getCustomerLibrary(customerId: string) {
    const entitlements = await prisma.entitlement.findMany({
      where: {
        customerId,
        status: 'ACTIVE'
      },
      include: {
        product: {
          include: {
            category: true,
            creator: { select: { id: true, name: true, avatarUrl: true } },
            versions: {
              orderBy: { publishedAt: 'desc' },
              include: { files: true }
            }
          }
        },
        orderItem: {
          include: {
            pricingPlan: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return entitlements;
  }

  static async verifyProductEntitlement(customerId: string, productId: string) {
    const entitlement = await prisma.entitlement.findFirst({
      where: {
        customerId,
        productId,
        status: 'ACTIVE'
      }
    });

    return {
      hasAccess: !!entitlement,
      entitlement
    };
  }

  static async getCreatorCustomers(creatorId: string) {
    const entitlements = await prisma.entitlement.findMany({
      where: {
        product: { creatorId }
      },
      include: {
        customer: { select: { id: true, name: true, email: true, avatarUrl: true } },
        product: { select: { id: true, title: true, slug: true } },
        orderItem: { include: { pricingPlan: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return entitlements;
  }
}
