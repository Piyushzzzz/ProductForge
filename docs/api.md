# ProductForge: REST API Specification

All API endpoints are prefixed with `/api` and exchange data using JSON format.

---

## 1. Module 1: Authentication & User (`/api/auth`, `/api/users`)
- `POST /api/auth/register` — Register a new account (`name`, `email`, `password`, `role`).
- `POST /api/auth/login` — Authenticate and receive signed JWT token & user object.
- `GET /api/auth/me` — Retrieve currently authenticated user and active session.
- `PUT /api/users/profile` — Update user profile information.

## 2. Module 2: Product Management (`/api/products`)
- `POST /api/products` — Create a new product (Creator/Admin).
- `GET /api/products` — List products created by the authenticated creator.
- `GET /api/products/:id` — Fetch complete product metadata and relations.
- `PUT /api/products/:id` — Update product details.
- `DELETE /api/products/:id` — Archive product.
- `PATCH /api/products/:id/status` — Transition product lifecycle (`DRAFT`, `BETA`, `PUBLISHED`, `ARCHIVED`).

## 3. Module 3: Marketplace & Discovery (`/api/marketplace`, `/api/categories`)
- `GET /api/marketplace/products` — Query published products with filter tags (`category`, `search`, `sort`, `page`).
- `GET /api/marketplace/products/:slug` — Get public product detail page info.
- `GET /api/categories` — Retrieve all product categories with count statistics.

## 4. Module 4: Release Management (`/api/products/:id/releases`, `/api/releases`)
- `POST /api/products/:id/releases` — Create new version release with changelog and notes.
- `GET /api/products/:id/releases` — List all releases for a product.
- `GET /api/releases/:id` — Get single release details.
- `PATCH /api/releases/:id` — Update release status / notes.

## 5. Module 5: File & Download Management (`/api/releases/:id/files`, `/api/files`)
- `POST /api/releases/:id/files` — Upload release asset binary (Creator/Admin).
- `GET /api/releases/:id/files` — List files attached to a release.
- `GET /api/files/:id/download` — Secure, entitlement-verified asset download stream.

## 6. Module 6: Orders & Payments (`/api/orders`, `/api/payments`)
- `POST /api/orders` — Create new checkout order.
- `GET /api/orders` — List authenticated user's order history.
- `GET /api/orders/:id` — Retrieve detailed order invoice.
- `POST /api/payments/simulate` — Execute sandbox payment verification and trigger entitlement.

## 7. Module 7: Entitlements & Customer Library (`/api/entitlements`)
- `GET /api/entitlements/my-library` — List all products owned by current customer.
- `GET /api/entitlements/verify/:productId` — Check if user has active entitlement for a product.
- `GET /api/entitlements/licenses` — Retrieve customer license keys.

## 8. Module 8: Reviews & Feedback (`/api/reviews`)
- `POST /api/reviews` — Submit verified-customer review (`productId`, `rating`, `comment`).
- `GET /api/products/:productId/reviews` — Get all public reviews for a product.
- `DELETE /api/reviews/:id` — Delete / moderate review (Admin/Author).

## 9. Module 9: Analytics & Telemetry (`/api/analytics`)
- `POST /api/analytics/event` — Log telemetry event (`PRODUCT_VIEW`, `PRODUCT_DOWNLOAD`, etc.).
- `GET /api/analytics/creator/summary` — Creator telemetry dashboard metrics (revenue, views, conversion).
- `GET /api/analytics/admin/overview` — Admin global platform metrics.

## 10. Module 10: Notifications (`/api/notifications`)
- `GET /api/notifications` — Fetch user notification feed.
- `PATCH /api/notifications/:id/read` — Mark notification as read.
- `PATCH /api/notifications/read-all` — Mark all notifications as read.
