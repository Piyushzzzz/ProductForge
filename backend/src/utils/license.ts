import crypto from 'crypto';

export const generateLicenseKey = (): string => {
  const segment1 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const segment2 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const segment3 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const segment4 = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `PF-${segment1}-${segment2}-${segment3}-${segment4}`;
};

export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `ORD-${timestamp}-${random}`;
};
