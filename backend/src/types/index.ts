import { Request } from 'express';

export type UserRole = 'CUSTOMER' | 'CREATOR' | 'ADMIN';

export type ProductStatus = 'DRAFT' | 'BETA' | 'PUBLISHED' | 'ARCHIVED';

export type PricingType = 'ONE_TIME' | 'RECURRING';

export type PricingInterval = 'MONTHLY' | 'YEARLY' | 'NONE';

export type OrderStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export type EntitlementStatus = 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}
