# ProductForge: Module Division & Engineering Boundaries

ProductForge organizes backend logic into 10 cohesive domain modules, ensuring separation of concerns and clear development boundaries:

| Module # | Domain Area | Responsibilities | Key Files / Paths |
| :--- | :--- | :--- | :--- |
| **M1** | Authentication & User Management | Registration, login, JWT issuance, bcrypt hashing, profile updates, RBAC checks | `controllers/auth.controller.ts`, `services/auth.service.ts`, `middleware/auth.middleware.ts` |
| **M2** | Product Lifecycle Management | Product CRUD, pricing plans, state transitions (`DRAFT` $\rightarrow$ `BETA` $\rightarrow$ `PUBLISHED` $\rightarrow$ `ARCHIVED`) | `controllers/product.controller.ts`, `services/product.service.ts` |
| **M3** | Marketplace & Discovery | Public product search, multi-category filtering, sorting algorithms, slug queries | `controllers/marketplace.controller.ts`, `services/marketplace.service.ts` |
| **M4** | Product Release Management | Versioning ($v1.0.0$), release notes authoring, changelog tracking, publishing | `controllers/release.controller.ts`, `services/release.service.ts` |
| **M5** | File Storage & Delivery | Protected binary storage, SHA-256 validation, entitlement-gated download streams | `controllers/file.controller.ts`, `services/file.service.ts`, `config/storage.config.ts` |
| **M6** | Order & Payment Sandbox | Order creation, transaction tracking, sandbox payment simulation, invoice generation | `controllers/order.controller.ts`, `services/order.service.ts` |
| **M7** | Entitlement & License Engine | Cryptographic license key generation, access verification, customer library aggregation | `controllers/entitlement.controller.ts`, `services/entitlement.service.ts` |
| **M8** | Reviews & Ratings | Verified-buyer review gating, rating recalculation, moderation | `controllers/review.controller.ts`, `services/review.service.ts` |
| **M9** | Analytics & Telemetry | Telemetry ingestion, aggregation pipelines (views, downloads, revenue, conversion rates) | `controllers/analytics.controller.ts`, `services/analytics.service.ts` |
| **M10** | Notifications & Real-Time | Real-time WebSocket (Socket.IO) push notifications, in-app notification center | `controllers/notification.controller.ts`, `sockets/notification.socket.ts` |
