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

  static async compareVersions(productId: string, options: {
    baseVersionId?: string;
    targetVersionId?: string;
    newVersionNumber?: string;
    newReleaseTitle?: string;
    newReleaseNotes?: string;
    newFileSize?: number;
    newFileName?: string;
  }) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        versions: {
          include: { files: true },
          orderBy: { publishedAt: 'desc' }
        }
      }
    });

    if (!product) throw { statusCode: 404, message: 'Product not found.' };

    // Determine base version (either specified or current active version)
    const baseVersion = options.baseVersionId
      ? product.versions.find(v => v.id === options.baseVersionId)
      : product.versions.find(v => v.isCurrent) || product.versions[0];

    // Determine target version
    let targetVersion: any = null;
    if (options.targetVersionId) {
      targetVersion = product.versions.find(v => v.id === options.targetVersionId);
    } else if (options.newVersionNumber) {
      targetVersion = {
        versionNumber: options.newVersionNumber,
        releaseTitle: options.newReleaseTitle || 'Proposed Release',
        releaseNotes: options.newReleaseNotes || '',
        files: options.newFileName ? [{
          fileName: options.newFileName,
          fileSize: options.newFileSize || 0,
          mimeType: 'application/zip'
        }] : []
      };
    }

    const baseVerStr = baseVersion?.versionNumber || 'v0.0.0';
    const targetVerStr = targetVersion?.versionNumber || 'v1.0.0';

    const semverDiff = compareSemVer(baseVerStr, targetVerStr);
    const notesDiff = diffLines(baseVersion?.releaseNotes || '', targetVersion?.releaseNotes || '');

    const baseFile = baseVersion?.files?.[0];
    const targetFile = targetVersion?.files?.[0];
    const oldSize = baseFile?.fileSize || 0;
    const newSize = targetFile?.fileSize || 0;
    const sizeDiff = newSize - oldSize;

    return {
      productId,
      baseVersion: baseVersion ? {
        id: baseVersion.id,
        versionNumber: baseVersion.versionNumber,
        releaseTitle: baseVersion.releaseTitle,
        releaseNotes: baseVersion.releaseNotes,
        publishedAt: baseVersion.publishedAt,
        files: baseVersion.files
      } : null,
      targetVersion: targetVersion ? {
        id: targetVersion.id || null,
        versionNumber: targetVersion.versionNumber,
        releaseTitle: targetVersion.releaseTitle,
        releaseNotes: targetVersion.releaseNotes,
        files: targetVersion.files
      } : null,
      semverDiff,
      notesDiff,
      fileDiff: {
        oldFileName: baseFile?.fileName || 'None',
        newFileName: targetFile?.fileName || 'None',
        oldSizeBytes: oldSize,
        newSizeBytes: newSize,
        sizeDiffBytes: sizeDiff,
        sizeDiffFormatted: formatBytesDiff(sizeDiff)
      }
    };
  }

  static async rollbackRelease(
    productId: string,
    targetVersionId: string,
    reason: string,
    creatorId: string,
    isAdmin: boolean = false
  ) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { versions: { include: { files: true } } }
    });

    if (!product) throw { statusCode: 404, message: 'Product not found.' };
    if (product.creatorId !== creatorId && !isAdmin) {
      throw { statusCode: 403, message: 'Unauthorized. Only the product creator can roll back releases.' };
    }

    const currentVersion = product.versions.find(v => v.isCurrent);
    const targetVersion = product.versions.find(v => v.id === targetVersionId);

    if (!targetVersion) {
      throw { statusCode: 404, message: 'Target version to roll back to was not found.' };
    }

    if (currentVersion && targetVersion.id === currentVersion.id) {
      throw { statusCode: 400, message: 'The selected version is already the active version.' };
    }

    // 1. Mark current version as rolled back & not current
    if (currentVersion) {
      await prisma.productVersion.update({
        where: { id: currentVersion.id },
        data: {
          isCurrent: false,
          isRolledBack: true,
          rollbackReason: reason || 'Rolled back due to critical issues reported.',
          rollbackAt: new Date()
        }
      });
    }

    // 2. Set all versions isCurrent to false first, then activate targetVersion
    await prisma.productVersion.updateMany({
      where: { productId },
      data: { isCurrent: false }
    });

    const restoredVersion = await prisma.productVersion.update({
      where: { id: targetVersion.id },
      data: {
        isCurrent: true
      },
      include: { files: true }
    });

    // 3. Log Telemetry
    try {
      await prisma.analyticsEvent.create({
        data: {
          productId,
          userId: creatorId,
          eventType: 'RELEASE_ROLLBACK',
          metadata: JSON.stringify({
            fromVersion: currentVersion?.versionNumber || 'unknown',
            toVersion: targetVersion.versionNumber,
            reason
          })
        }
      });
    } catch {
      // Ignore background analytics logging errors
    }

    // 4. Notify Entitled Customers
    try {
      const entitlements = await prisma.entitlement.findMany({
        where: { productId, status: 'ACTIVE' },
        select: { customerId: true }
      });

      if (entitlements.length > 0) {
        await prisma.notification.createMany({
          data: entitlements.map(e => ({
            userId: e.customerId,
            title: `Safety Rollback: ${product.title} reverted to ${targetVersion.versionNumber}`,
            message: `Version ${currentVersion?.versionNumber || 'latest'} was rolled back to stable release ${targetVersion.versionNumber}. Reason: ${reason || 'Stability update'}. Your download link is automatically updated.`,
            type: 'RELEASE',
            linkUrl: `/products/${product.slug}`
          }))
        });
      }
    } catch (e) {
      console.error('Error broadcasting rollback notifications:', e);
    }

    return {
      success: true,
      restoredVersion,
      rolledBackVersion: currentVersion,
      message: `Successfully rolled back to stable release ${targetVersion.versionNumber}. Entitled customers have been updated.`
    };
  }
}

// ─── Helpers for SemVer & Diff ───────────────────────────────────────────────
function parseSemVer(v: string) {
  const clean = (v || '').replace(/^v/i, '').trim();
  const parts = clean.split('.').map(p => parseInt(p, 10) || 0);
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0,
    raw: v
  };
}

function compareSemVer(baseVer: string, targetVer: string) {
  const b = parseSemVer(baseVer);
  const t = parseSemVer(targetVer);

  if (t.major > b.major) {
    return {
      bumpType: 'MAJOR',
      isUpgrade: true,
      summary: `Major Version Upgrade (${baseVer} → ${targetVer}): Potential breaking architectural changes`
    };
  } else if (t.major < b.major) {
    return {
      bumpType: 'DOWNGRADE',
      isUpgrade: false,
      summary: `Major Version Downgrade (${baseVer} → ${targetVer})`
    };
  }

  if (t.minor > b.minor) {
    return {
      bumpType: 'MINOR',
      isUpgrade: true,
      summary: `Minor Version Update (${baseVer} → ${targetVer}): New backwards-compatible capabilities`
    };
  } else if (t.minor < b.minor) {
    return {
      bumpType: 'DOWNGRADE',
      isUpgrade: false,
      summary: `Minor Version Downgrade (${baseVer} → ${targetVer})`
    };
  }

  if (t.patch > b.patch) {
    return {
      bumpType: 'PATCH',
      isUpgrade: true,
      summary: `Patch Release (${baseVer} → ${targetVer}): Bug fixes, security patches & maintenance`
    };
  } else if (t.patch < b.patch) {
    return {
      bumpType: 'DOWNGRADE',
      isUpgrade: false,
      summary: `Patch Downgrade (${baseVer} → ${targetVer})`
    };
  }

  return {
    bumpType: 'SAME',
    isUpgrade: false,
    summary: `Identical version tag (${baseVer})`
  };
}

function diffLines(oldText: string, newText: string) {
  const oldLines = (oldText || '').split('\n').map(l => l.trim()).filter(Boolean);
  const newLines = (newText || '').split('\n').map(l => l.trim()).filter(Boolean);

  const oldSet = new Set(oldLines);
  const newSet = new Set(newLines);

  const added = newLines.filter(l => !oldSet.has(l));
  const removed = oldLines.filter(l => !newSet.has(l));
  const unchanged = newLines.filter(l => oldSet.has(l));

  return { added, removed, unchanged };
}

function formatBytesDiff(diff: number) {
  if (diff === 0) return '0 B (Identical)';
  const sign = diff > 0 ? '+' : '-';
  const abs = Math.abs(diff);
  if (abs < 1024) return `${sign}${abs} B`;
  if (abs < 1024 * 1024) return `${sign}${(abs / 1024).toFixed(1)} KB`;
  return `${sign}${(abs / (1024 * 1024)).toFixed(2)} MB`;
}
