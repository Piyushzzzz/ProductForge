# ProductForge: System Architecture & Design

## 1. High-Level Architectural Model

ProductForge is built as a **Modular Monolith** system designed for high developer productivity, clear domain boundaries, and straightforward deployment.

```mermaid
graph TB
    subgraph Presentation Layer
        FE[React + TypeScript + Tailwind CSS Frontend]
        DesignB[Design B: Modern SaaS Glassmorphism UI]
        FE --- DesignB
    end

    subgraph Communication Layer
        REST[REST API - JSON over HTTP/HTTPS]
        WS[Socket.IO - Real-Time Push Events]
    end

    FE -->|HTTP Requests| REST
    FE -->|WebSocket| WS

    subgraph Application & Business Logic Layer
        MW[Middleware: Auth Guard / RBAC / Validator / Error Handler]
        
        subgraph Domain Modules
            M1[Module 1: Auth & User Profile]
            M2[Module 2: Product Lifecycle]
            M3[Module 3: Marketplace & Search]
            M4[Module 4: Release & SemVer]
            M5[Module 5: File & Protected Storage]
            M6[Module 6: Order & Payment Sandbox]
            M7[Module 7: Entitlement Engine]
            M8[Module 8: Reviews & Ratings]
            M9[Module 9: Telemetry & Analytics]
            M10[Module 10: Notification Hub]
        end
    end

    REST --> MW
    MW --> M1 & M2 & M3 & M4 & M5 & M6 & M7 & M8 & M9 & M10
    WS --> M10

    subgraph Data & Storage Layer
        Prisma[Prisma Data Access Layer / Repositories]
        DB[(PostgreSQL Relational Database)]
        Storage[(Local File Storage / Cloud Bucket)]
    end

    M1 & M2 & M3 & M4 & M6 & M7 & M8 & M9 & M10 --> Prisma
    M5 --> Storage
    Prisma --> DB
```

---

## 2. Layered Component Architecture

Every module strictly adheres to the 4-layer separation:

```text
Request (Client)
      ↓
[ Route Layer ]       --> URL mapping, HTTP verbs, auth middleware
      ↓
[ Controller Layer ]  --> Request parsing, schema validation, HTTP responses
      ↓
[ Service Layer ]     --> Pure business rules, lifecycle transitions, calculations
      ↓
[ Repository Layer ]  --> Prisma ORM data queries, database transactions
      ↓
Response (JSON)
```

---

## 3. Data Flow: End-to-End Product Purchase & Release Access

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant FE as React Frontend
    participant API as Express API
    participant Ent as Entitlement Service
    participant DB as PostgreSQL (Prisma)
    participant Storage as File Storage

    Customer->>FE: Click "Instant Buy" for InvoicePro
    FE->>API: POST /api/orders { productId, planId }
    API->>DB: Create Order (Status: PENDING)
    API->>API: Process Sandbox Payment
    API->>DB: Update Order (Status: COMPLETED)
    API->>Ent: Provision Entitlement
    Ent->>DB: Insert Entitlement (LicenseKey: PF-8F03-XXXX, Status: ACTIVE)
    API-->>FE: Return Order Receipt & Entitlement
    FE->>Customer: Display "Access Granted" in Customer Library
    
    Customer->>FE: Click "Download Release v1.2.0"
    FE->>API: GET /api/releases/:id/download (with JWT)
    API->>DB: Verify Entitlement (Customer + Product)
    DB-->>API: Entitlement VALID
    API->>Storage: Stream Binary Asset
    Storage-->>Customer: Binary Download Starts (.zip)
```
