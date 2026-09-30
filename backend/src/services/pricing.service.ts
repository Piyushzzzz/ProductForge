import { prisma } from '../config/db.js';

export class PricingService {
  static async getPlansByProduct(productId: string) {
    return await prisma.pricingPlan.findMany({
      where: { productId },
      orderBy: { price: 'asc' }
    });
  }

  static async createPlan(productId: string, data: { name: string; type: string; price: number; interval?: string; features: string[] | string }) {
    const featuresJson = typeof data.features === 'string' ? data.features : JSON.stringify(data.features || []);

    return await prisma.pricingPlan.create({
      data: {
        productId,
        name: data.name,
        type: data.type || 'ONE_TIME',
        price: Number(data.price),
        interval: data.interval || 'NONE',
        features: featuresJson
      }
    });
  }

  static async updatePlan(planId: string, data: { name?: string; type?: string; price?: number; interval?: string; features?: string[] | string }) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.price !== undefined) updateData.price = Number(data.price);
    if (data.interval !== undefined) updateData.interval = data.interval;
    if (data.features !== undefined) {
      updateData.features = typeof data.features === 'string' ? data.features : JSON.stringify(data.features);
    }

    return await prisma.pricingPlan.update({
      where: { id: planId },
      data: updateData
    });
  }

  static async deletePlan(planId: string) {
    return await prisma.pricingPlan.delete({
      where: { id: planId }
    });
  }
}
