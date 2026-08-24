export type UserRole = 'CUSTOMER' | 'CREATOR' | 'ADMIN';
export type ProductStatus = 'DRAFT' | 'BETA' | 'PUBLISHED' | 'ARCHIVED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  creatorProfile?: {
    id: string;
    bio?: string;
    website?: string;
    githubUrl?: string;
    rating?: number;
    totalSales?: number;
  };
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  _count?: {
    products: number;
  };
}

export interface PricingPlan {
  id: string;
  productId: string;
  name: string;
  type: 'ONE_TIME' | 'RECURRING';
  price: number;
  interval: string;
  features: string | string[];
}

export interface ProductFile {
  id: string;
  versionId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  checksum: string;
  createdAt: string;
}

export interface ProductVersion {
  id: string;
  productId: string;
  versionNumber: string;
  releaseTitle: string;
  releaseNotes: string;
  changelog: string;
  isBeta: boolean;
  isCurrent: boolean;
  publishedAt: string;
  files?: ProductFile[];
}

export interface Review {
  id: string;
  customerId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
  customer?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

export interface Product {
  id: string;
  creatorId: string;
  categoryId: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  status: ProductStatus;
  demoUrl?: string;
  githubRepo?: string;
  logoUrl?: string;
  bannerUrl?: string;
  averageRating: number;
  totalReviews: number;
  totalPurchases: number;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  creator?: {
    id: string;
    name: string;
    avatarUrl?: string;
    creatorProfile?: any;
  };
  pricingPlans?: PricingPlan[];
  versions?: ProductVersion[];
  reviews?: Review[];
}

export interface Entitlement {
  id: string;
  customerId: string;
  productId: string;
  licenseKey: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
  expiresAt?: string;
  createdAt: string;
  product: Product;
  orderItem?: {
    pricingPlan: PricingPlan;
  };
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'RELEASE' | 'PURCHASE' | 'REVIEW';
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}
