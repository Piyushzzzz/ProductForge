# ProductForge: Non-Functional Requirements Specification

## 1. Security Requirements (NFR-SEC)
- **NFR-SEC-1 (Password Protection):** Passwords hashed using bcrypt with work factor $\ge 10$. Plaintext passwords are never stored or logged.
- **NFR-SEC-2 (Token Security):** JWT tokens signed using SHA-256 HMAC (`HS256`) with secret keys loaded strictly via environment variables.
- **NFR-SEC-3 (Asset Gating):** Protected software binaries stored outside web root; accessible only via verified entitlement token.
- **NFR-SEC-4 (Input Sanitization):** All incoming HTTP request payloads validated using type guards and strict sanitization.
- **NFR-SEC-5 (CORS Policy):** Cross-Origin Resource Sharing configured to allow only authorized frontend client origins.

## 2. Performance & Scalability (NFR-PERF)
- **NFR-PERF-1 (Response Latency):** Core REST API endpoints (Browse, Read, Verify) respond within $\le 150\text{ms}$ under standard loads.
- **NFR-PERF-2 (Database Indexing):** Indexed foreign keys and high-frequency search fields (`slug`, `categoryId`, `status`, `creatorId`, `customerId`).
- **NFR-PERF-3 (Asset Streaming):** Binary downloads streamed via Node.js streams to minimize memory footprint.

## 3. Reliability & Maintainability (NFR-MAINT)
- **NFR-MAINT-1 (Modular Monolith):** Clear separation into Controllers, Services, Repositories, and Utilities.
- **NFR-MAINT-2 (Type Safety):** 100% TypeScript coverage across backend and frontend to eliminate runtime typing errors.
- **NFR-MAINT-3 (Database Migrations):** Reproducible schema versioning using Prisma Migrations.
- **NFR-MAINT-4 (Centralized Error Handling):** Standardized HTTP error response contract across all modules:
  ```json
  {
    "success": false,
    "error": {
      "code": "UNAUTHORIZED_ACCESS",
      "message": "Valid entitlement required to download this asset."
    }
  }
  ```

## 4. Usability & Aesthetics (NFR-UX)
- **NFR-UX-1 (Design System):** Consistent **Design B (Modern SaaS Dark Indigo Glassmorphism)** with Geist/Inter typography and JetBrains Mono code badges.
- **NFR-UX-2 (Responsiveness):** 100% responsive interface supporting Desktop ($1920\times1080$), Laptop ($1366\times768$), and Mobile devices.
- **NFR-UX-3 (Feedback & State):** Micro-animations, skeleton loaders, and instant toast notifications on actions.
