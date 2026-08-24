import { prisma } from '../config/db.js';

export class ReviewService {
  static async addReview(customerId: string, data: {
    productId: string;
    rating: number;
    comment: string;
  }) {
    if (data.rating < 1 || data.rating > 5) {
      throw { statusCode: 400, message: 'Rating must be an integer between 1 and 5.' };
    }

    // Verify customer owns the product
    const entitlement = await prisma.entitlement.findFirst({
      where: {
        customerId,
        productId: data.productId,
        status: 'ACTIVE'
      }
    });

    if (!entitlement) {
      throw {
        statusCode: 403,
        message: 'Only verified customers who purchased this product can leave a review.',
        code: 'VERIFIED_PURCHASE_REQUIRED'
      };
    }

    const review = await prisma.review.create({
      data: {
        customerId,
        productId: data.productId,
        rating: Math.round(data.rating),
        comment: data.comment
      },
      include: {
        customer: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    // Recalculate average rating & total reviews
    const aggregate = await prisma.review.aggregate({
      where: { productId: data.productId },
      _avg: { rating: true },
      _count: { id: true }
    });

    await prisma.product.update({
      where: { id: data.productId },
      data: {
        averageRating: Number((aggregate._avg.rating || 0).toFixed(1)),
        totalReviews: aggregate._count.id
      }
    });

    return review;
  }

  static async getProductReviews(productId: string) {
    return prisma.review.findMany({
      where: { productId },
      include: {
        customer: { select: { id: true, name: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async deleteReview(reviewId: string, userId: string, isAdmin: boolean = false) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw { statusCode: 404, message: 'Review not found.' };

    if (review.customerId !== userId && !isAdmin) {
      throw { statusCode: 403, message: 'Unauthorized to delete this review.' };
    }

    await prisma.review.delete({ where: { id: reviewId } });

    // Recalculate
    const aggregate = await prisma.review.aggregate({
      where: { productId: review.productId },
      _avg: { rating: true },
      _count: { id: true }
    });

    await prisma.product.update({
      where: { id: review.productId },
      data: {
        averageRating: Number((aggregate._avg.rating || 0).toFixed(1)),
        totalReviews: aggregate._count.id
      }
    });

    return { success: true };
  }
}
