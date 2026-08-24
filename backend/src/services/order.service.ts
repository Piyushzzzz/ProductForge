import { prisma } from '../config/db.js';
import { generateLicenseKey, generateOrderNumber } from '../utils/license.js';
import crypto from 'crypto';

export class OrderService {
  static async createOrderAndCheckout(customerId: string, data: {
    productId: string;
    pricingPlanId: string;
  }) {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      include: { pricingPlans: true, creator: true }
    });

    if (!product) throw { statusCode: 404, message: 'Product not found.' };

    const plan = product.pricingPlans.find(p => p.id === data.pricingPlanId);
    if (!plan) throw { statusCode: 400, message: 'Invalid pricing plan selected.' };

    const orderNumber = generateOrderNumber();
    const transactionId = 'TXN-' + crypto.randomBytes(4).toString('hex').toUpperCase();

    // Transaction: Create Order, Payment, and Entitlement atomically
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Order
      const order = await tx.order.create({
        data: {
          customerId,
          orderNumber,
          totalAmount: plan.price,
          status: 'COMPLETED', // In sandbox mode, instant completion
          items: {
            create: {
              productId: product.id,
              pricingPlanId: plan.id,
              price: plan.price
            }
          }
        },
        include: { items: true }
      });

      const orderItem = order.items[0];

      // 2. Create Payment Record
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          transactionId,
          provider: 'SANDBOX',
          status: 'COMPLETED',
          amount: plan.price
        }
      });

      // 3. Generate Entitlement and License Key
      const licenseKey = generateLicenseKey();
      const entitlement = await tx.entitlement.create({
        data: {
          customerId,
          productId: product.id,
          orderItemId: orderItem.id,
          licenseKey,
          status: 'ACTIVE'
        }
      });

      // 4. Update Product Total Purchases & Creator Total Sales
      await tx.product.update({
        where: { id: product.id },
        data: { totalPurchases: { increment: 1 } }
      });

      await tx.creatorProfile.updateMany({
        where: { userId: product.creatorId },
        data: { totalSales: { increment: plan.price } }
      });

      // 5. Ingest Telemetry event
      await tx.analyticsEvent.create({
        data: {
          productId: product.id,
          userId: customerId,
          eventType: 'PRODUCT_PURCHASE',
          metadata: JSON.stringify({ amount: plan.price, plan: plan.name, orderNumber })
        }
      });

      // 6. Create Customer & Creator Notifications
      await tx.notification.create({
        data: {
          userId: customerId,
          title: `Purchase Confirmed: ${product.title}`,
          message: `Your order ${orderNumber} is complete. License key ${licenseKey} has been activated in your library.`,
          type: 'PURCHASE',
          linkUrl: '/library'
        }
      });

      await tx.notification.create({
        data: {
          userId: product.creatorId,
          title: `New Sale: ${product.title}`,
          message: `A customer purchased the ${plan.name} plan for $${plan.price.toFixed(2)}.`,
          type: 'SUCCESS',
          linkUrl: '/creator/analytics'
        }
      });

      return {
        order,
        payment,
        entitlement
      };
    });

    return result;
  }

  static async getCustomerOrders(customerId: string) {
    return prisma.order.findMany({
      where: { customerId },
      include: {
        items: {
          include: {
            product: true,
            pricingPlan: true,
            entitlement: true
          }
        },
        payment: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getOrderById(orderId: string, customerId: string, isAdmin: boolean = false) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: { include: { versions: { where: { isCurrent: true }, include: { files: true } } } },
            pricingPlan: true,
            entitlement: true
          }
        },
        payment: true
      }
    });

    if (!order) throw { statusCode: 404, message: 'Order not found.' };
    if (order.customerId !== customerId && !isAdmin) {
      throw { statusCode: 403, message: 'Unauthorized to view this order.' };
    }

    return order;
  }
}
