# ProductForge: Functional Requirements Specification

## 1. User Roles & Personas
- **Customer (FR-CUST):** Software buyers, engineers, and companies purchasing software tools.
- **Creator (FR-CREAT):** Software authors, SaaS engineers, and toolmakers publishing and managing digital products.
- **Admin (FR-ADM):** Platform operators moderating products, categories, users, and overall system health.

---

## 2. Detailed Functional Requirements by Module

### Module 1: Authentication & User Management
- **FR-1.1:** User Registration with Email, Password, Name, and Role selection (`CUSTOMER`, `CREATOR`).
- **FR-1.2:** Password hashing with `bcrypt` (minimum 10 salt rounds).
- **FR-1.3:** JWT-based stateless authentication issuing signed Bearer tokens.
- **FR-1.4:** Role-Based Access Control (RBAC) middleware verifying persona authorizations on all protected endpoints.
- **FR-1.5:** User Profile management (updating biography, website, GitHub URL, and avatar).

### Module 2: Product Lifecycle Management
- **FR-2.1:** Product creation with title, slug, tagline, detailed description, category, demo URL, and repository link.
- **FR-2.2:** Multi-tier Pricing Plan configuration (One-time purchase, Recurring Monthly/Yearly subscriptions).
- **FR-2.3:** State Machine enforcement: `DRAFT` $\rightarrow$ `BETA` $\rightarrow$ `PUBLISHED` $\rightarrow$ `ARCHIVED`.
- **FR-2.4:** Product editing, archiving, and status transitions restricted to the verified product owner or platform admin.

### Module 3: Marketplace & Discovery
- **FR-3.1:** Public product browsing with category filtering (SaaS, APIs, CLI, Plugins, SDKs, UI Kits).
- **FR-3.2:** Full-text keyword search indexing title, tagline, description, and tags.
- **FR-3.3:** Sorting by popularity, newest release, rating, and price.
- **FR-3.4:** Public Product Detail page rendering active version, release notes, pricing tiers, creator profile, and customer reviews.

### Module 4: Product Release Management
- **FR-4.1:** Version creation enforcing Semantic Versioning (SemVer $vMAJOR.MINOR.PATCH$).
- **FR-4.2:** Structured Changelog and Release Notes authoring.
- **FR-4.3:** Release publishing workflow making new versions available to entitled customers.
- **FR-4.4:** Version history audit trail preserving previous release notes and assets.

### Module 5: Product File Management & Delivery
- **FR-5.1:** File asset upload for releases (ZIP binaries, packages, documentation archives).
- **FR-5.2:** Metadata capture (file size, MIME type, SHA-256 checksum).
- **FR-5.3:** Protected download gateway: validates active customer entitlement before streaming or providing presigned download tokens.
- **FR-5.4:** Direct public access to private artifact storage is strictly prohibited.

### Module 6: Order & Payment Processing
- **FR-6.1:** Cart and instant checkout initiation.
- **FR-6.2:** Sandbox payment simulation with transaction ID generation and verification.
- **FR-6.3:** Order status lifecycle: `PENDING` $\rightarrow$ `COMPLETED` / `FAILED`.
- **FR-6.4:** Order history and itemized invoice receipt generation.

### Module 7: Entitlement & License Engine
- **FR-7.1:** Automatic Entitlement provisioning upon verified order completion.
- **FR-7.2:** Unique cryptographic License Key generation (`PF-XXXX-XXXX-XXXX`).
- **FR-7.3:** Entitlement status verification (`ACTIVE`, `SUSPENDED`, `EXPIRED`).
- **FR-7.4:** Customer Library portal listing all entitled digital assets with direct access links.

### Module 8: Reviews & Customer Feedback
- **FR-8.1:** Verified-buyer review gating: only customers with an `ACTIVE` entitlement can submit a rating and review.
- **FR-8.2:** 1 to 5 star rating with written feedback.
- **FR-8.3:** Real-time recalculation of product average rating and total review counts.
- **FR-8.4:** Admin moderation for spam or abusive reviews.

### Module 9: Analytics & Telemetry
- **FR-9.1:** Asynchronous event ingestion: `PRODUCT_VIEW`, `PRODUCT_PURCHASE`, `PRODUCT_DOWNLOAD`, `RELEASE_VIEW`.
- **FR-9.2:** Aggregated metric calculation: Gross Revenue, Current Version Downloads, Conversion Rate, View Counts.
- **FR-9.3:** Creator analytics dashboard with time-series telemetry charts.

### Module 10: Notifications & Real-Time Engine
- **FR-10.1:** In-app notification center for users.
- **FR-10.2:** Event-triggered alerts (Purchase confirmation, New version release, Review received).
- **FR-10.3:** Real-time push delivery via WebSocket / Socket.IO.
