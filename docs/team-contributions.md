# ProductForge: Team Module Ownership & Academic Contributions

This project is structured for collaborative development in a university Back-end Engineering (BEE) course. Each team member owns specific domain modules and their corresponding database models, API endpoints, backend logic, and frontend integration:

---

### Team Member 1: Authentication & Identity Management
- **Assigned Module:** Module 1 (Auth & User Management)
- **Database Tables:** `User`, `CreatorProfile`
- **APIs:** `/api/auth/*`, `/api/users/*`
- **Responsibilities:** JWT token lifecycle, bcrypt password hashing, RBAC middleware, secure user profiles.

---

### Team Member 2: Product Catalog & Marketplace Engine
- **Assigned Modules:** Module 2 (Product Management), Module 3 (Marketplace & Discovery)
- **Database Tables:** `Product`, `Category`, `PricingPlan`
- **APIs:** `/api/products/*`, `/api/marketplace/*`, `/api/categories/*`
- **Responsibilities:** Product lifecycle status machine (`DRAFT` $\rightarrow$ `BETA` $\rightarrow$ `PUBLISHED` $\rightarrow$ `ARCHIVED`), multi-tier pricing plans, search indexing and category filters.

---

### Team Member 3: Release Engineering & Protected File Delivery
- **Assigned Modules:** Module 4 (Product Release Management), Module 5 (Product File Management)
- **Database Tables:** `ProductVersion`, `ProductFile`
- **APIs:** `/api/releases/*`, `/api/files/*`
- **Responsibilities:** Semantic versioning ($v1.0.0, v1.1.0$), release notes/changelog parsing, checksum generation, secure entitlement-gated binary download streaming.

---

### Team Member 4: Commerce, Payments & Entitlements Engine
- **Assigned Modules:** Module 6 (Order & Payment Sandbox), Module 7 (Entitlement & License Engine)
- **Database Tables:** `Order`, `OrderItem`, `Payment`, `Entitlement`
- **APIs:** `/api/orders/*`, `/api/payments/*`, `/api/entitlements/*`
- **Responsibilities:** Sandbox checkout simulation, cryptographic license key generation, access verification engine, customer library aggregation.

---

### Team Member 5: Telemetry, Reviews & Real-Time Notification System
- **Assigned Modules:** Module 8 (Reviews & Ratings), Module 9 (Analytics & Telemetry), Module 10 (Real-Time Notifications)
- **Database Tables:** `Review`, `AnalyticsEvent`, `Notification`
- **APIs:** `/api/reviews/*`, `/api/analytics/*`, `/api/notifications/*`
- **Responsibilities:** Verified-buyer review gating, creator telemetry pipelines (revenue, downloads, conversions), Socket.IO real-time event broadcasting.
