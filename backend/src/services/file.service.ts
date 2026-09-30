import { prisma } from '../config/db.js';
import { ENV } from '../config/env.js';
import fs from 'fs';
import path from 'path';

// Resolve the uploads root once at module load — used for path traversal guard
const UPLOADS_ROOT = path.resolve(ENV.UPLOAD_DIR);

export class FileService {
  static async getProtectedFileDownload(fileId: string, customerId: string, isAdmin: boolean = false) {
    const file = await prisma.productFile.findUnique({
      where: { id: fileId },
      include: {
        version: {
          include: { product: true }
        }
      }
    });

    if (!file) {
      throw { statusCode: 404, message: 'File not found.' };
    }

    const productId = file.version.productId;
    const isCreator = file.version.product.creatorId === customerId;

    if (!isAdmin && !isCreator) {
      // Check for active customer entitlement
      const entitlement = await prisma.entitlement.findFirst({
        where: {
          customerId,
          productId,
          status: 'ACTIVE'
        }
      });

      if (!entitlement) {
        throw {
          statusCode: 403,
          message: 'Access Denied. You do not hold an active license entitlement for this digital asset.',
          code: 'ENTITLEMENT_REQUIRED'
        };
      }
    }

    // If external URL (e.g. GitHub release asset), return it directly for redirect
    if (file.storagePath.startsWith('http://') || file.storagePath.startsWith('https://')) {
      try {
        await prisma.analyticsEvent.create({
          data: {
            productId,
            userId: customerId,
            eventType: 'PRODUCT_DOWNLOAD',
            metadata: JSON.stringify({ fileId: file.id, fileName: file.fileName, version: file.version.versionNumber, externalUrl: file.storagePath })
          }
        });
      } catch {
        // Ignore background analytics logging errors
      }

      return {
        isExternalUrl: true,
        downloadUrl: file.storagePath,
        filePath: null,
        fileName: file.fileName,
        mimeType: file.mimeType
      };
    }

    // ─── SECURITY: Path Traversal Guard ──────────────────────────────────
    // Resolve the absolute path from the stored value, then verify it is
    // strictly inside the uploads root directory. Rejects any path that
    // escapes via '../../../etc/passwd' or symlink tricks.
    const resolvedPath = path.resolve(file.storagePath);
    if (!resolvedPath.startsWith(UPLOADS_ROOT + path.sep) && resolvedPath !== UPLOADS_ROOT) {
      throw {
        statusCode: 403,
        message: 'Access Denied. Invalid file path.',
        code: 'PATH_TRAVERSAL_REJECTED'
      };
    }

    // Verify disk file exists
    if (!fs.existsSync(resolvedPath)) {
      throw { statusCode: 404, message: 'Physical file artifact not found on storage server.' };
    }

    // Telemetry log for download
    try {
      await prisma.analyticsEvent.create({
        data: {
          productId,
          userId: customerId,
          eventType: 'PRODUCT_DOWNLOAD',
          metadata: JSON.stringify({ fileId: file.id, fileName: file.fileName, version: file.version.versionNumber })
        }
      });
    } catch {
      // Ignore background analytics logging errors
    }

    return {
      filePath: resolvedPath,
      fileName: file.fileName,
      mimeType: file.mimeType
    };
  }
}
