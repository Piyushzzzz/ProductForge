# ProductForge: Team Module Ownership & Academic Contributions

This project is structured for collaborative development in a university Back-end Engineering (BEE) course. The platform's 10 domain modules are divided between **2 Team Members**, mapping specific database models, API endpoints, backend business logic, and frontend integration to each member:

---

### Team Member 1: Product Architecture, Auth & Release Engineering Lead
- **Assigned Modules:** 
  - **Module 1:** Authentication & User Management
  - **Module 2:** Product Lifecycle Management
  - **Module 3:** Marketplace & Discovery Engine
  - **Module 4:** Product Release Management
  - **Module 5:** Protected File Storage & Delivery
- **Database Tables:** `User`, `CreatorProfile`, `Product`, `Category`, `PricingPlan`, `ProductVersion`, `ProductFile`
- **APIs:** `/api/auth/*`, `/api/users/*`, `/api/products/*`, `/api/marketplace/*`, `/api/categories/*`, `/api/releases/*`, `/api/files/*`
- **Key Responsibilities:**
  - JWT token lifecycle, bcrypt password hashing, RBAC middleware (`CUSTOMER`, `CREATOR`, `ADMIN`), and secure user profiles.
  - Visual 4-state product lifecycle status machine (`DRAFT` $\rightarrow$ `BETA` $\rightarrow$ `PUBLISHED` $\rightarrow$ `ARCHIVED`) and multi-tier pricing plan configuration.
  - Marketplace search indexing, category filtering, and slug generation.
  - Semantic Versioning ($v1.0.0, v1.1.0$), changelog/release notes parsing, and checksum validation.
  - Entitlement-gated binary download streaming with path traversal protection.

---

### Team Member 2: Commerce, Entitlements, Telemetry & Real-Time Systems Lead
- **Assigned Modules:** 
  - **Module 6:** Order & Payment Sandbox Engine
  - **Module 7:** Entitlement & License Key Engine
  - **Module 8:** Verified Customer Reviews
  - **Module 9:** Analytics & Telemetry Engine
  - **Module 10:** Real-Time Notification Gateway
- **Database Tables:** `Order`, `OrderItem`, `Payment`, `Entitlement`, `Review`, `AnalyticsEvent`, `Notification`
- **APIs:** `/api/orders/*`, `/api/payments/*`, `/api/entitlements/*`, `/api/reviews/*`, `/api/analytics/*`, `/api/notifications/*`
- **Key Responsibilities:**
  - Sandbox checkout payment simulation, order number generation, and instant checkout handling.
  - Cryptographic license key issuance (`PF-XXXX-XXXX-XXXX`), customer library entitlement aggregation, and access control validation.
  - Verified-buyer gated review posting and dynamic average rating calculation.
  - Event telemetry logging (`PRODUCT_VIEW`, `PRODUCT_PURCHASE`, `PRODUCT_DOWNLOAD`) and creator/admin telemetry dashboard metrics.
  - Socket.IO WebSocket server implementation and real-time notification broadcasting.
