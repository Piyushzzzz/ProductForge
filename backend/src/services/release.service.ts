import { prisma } from '../config/db.js';
import crypto from 'crypto';
import fs from 'fs';

export class ReleaseService {
  static async createRelease(productId: string, creatorId: string, data: {
    versionNumber: string;
    releaseTitle: string;
    releaseNotes: string;
    changelog: string;
    isBeta?: boolean;
  }, isAdmin: boolean = false) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw { statusCode: 404, message: 'Product not found.' };

    if (product.creatorId !== creatorId && !isAdmin) {
      throw { statusCode: 403, message: 'Unauthorized.' };
    }

    // Set other versions isCurrent to false
    await prisma.productVersion.updateMany({
      where: { productId },
      data: { isCurrent: false }
    });

    const release = await prisma.productVersion.create({
      data: {
        productId,
        versionNumber: data.versionNumber,
        releaseTitle: data.releaseTitle,
        releaseNotes: data.releaseNotes,
        changelog: data.changelog,
        isBeta: data.isBeta || false,
        isCurrent: true
      }
    });

    // Notify entitled customers about the new release
    try {
      const entitlements = await prisma.entitlement.findMany({
        where: { productId, status: 'ACTIVE' },
        select: { customerId: true }
      });

      if (entitlements.length > 0) {
        await prisma.notification.createMany({
          data: entitlements.map(e => ({
            userId: e.customerId,
            title: `New Release: ${product.title} ${data.versionNumber}`,
            message: `${data.releaseTitle} is now available to download in your library!`,
            type: 'RELEASE',
            linkUrl: `/products/${product.slug}`
          }))
        });
      }
    } catch (e) {
      console.error('Error creating release notifications:', e);
    }

    return release;
  }

  static async getReleases(productId: string) {
    return prisma.productVersion.findMany({
      where: { productId },
      include: { files: true },
      orderBy: { publishedAt: 'desc' }
    });
  }

  static async attachFile(versionId: string, creatorId: string, file: Express.Multer.File, isAdmin: boolean = false) {
    const version = await prisma.productVersion.findUnique({
      where: { id: versionId },
      include: { product: true }
    });

    if (!version) throw { statusCode: 404, message: 'Version not found.' };
    if (version.product.creatorId !== creatorId && !isAdmin) {
      throw { statusCode: 403, message: 'Unauthorized.' };
    }

    // Compute checksum
    const fileBuffer = fs.readFileSync(file.path);
    const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    const productFile = await prisma.productFile.create({
      data: {
        versionId,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        storagePath: file.path,
        checksum
      }
    });

    return productFile;
  }
}
