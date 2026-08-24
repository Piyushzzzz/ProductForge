# ProductForge: Cloud-Based Digital Product Marketplace and Lifecycle Management Platform

## ROLE

Act as a senior full-stack software engineer, backend architect, database designer, UI/UX engineer, and technical project mentor.

Build a complete academic but production-quality full-stack project named:

**ProductForge**

Official project title:

**ProductForge: Cloud-Based Digital Product Marketplace and Lifecycle Management Platform**

The project is being developed for a university Back-end Engineering course.

The project must demonstrate:

- Requirement Analysis
- System Design
- Backend Engineering
- REST API development
- Relational database design
- Authentication and authorization
- Module-based development
- React frontend development
- Frontend-backend integration
- GitHub-based team development
- Clean project documentation

Do not build unnecessary enterprise complexity. The architecture should be realistic, maintainable, understandable by university students, and expandable in the future.

---

# 1. PROJECT CONCEPT

ProductForge is a cloud-based platform where developers and software creators can publish, sell, distribute, update, and manage software-based digital products throughout their lifecycle.

The platform is NOT a generic marketplace for physical goods.

The primary products are software-based digital products such as:

- SaaS products
- APIs
- Browser extensions
- Plugins
- Developer tools
- CLI tools
- Software templates
- Starter kits
- UI component libraries
- Downloadable software
- SDKs and developer packages

The core concept is:

**Create → Publish → Sell → Give Access → Release Updates → Manage Customers → Analyze Product**

The digital product remains the central entity throughout its lifecycle.

Example:

A developer publishes:

**InvoicePro v1.0**

Customers purchase it.

Later the developer releases:

**InvoicePro v1.1**

The platform maintains:

- Product information
- Version history
- Release notes
- Product files
- Customer ownership/access
- Orders
- Reviews
- Analytics
- Notifications

The platform should therefore be more than a simple e-commerce website.

---

# 2. CORE USER ROLES

Implement three primary roles.

## CREATOR

Creators can:

- Register/login
- Create products
- Edit products
- Publish products
- Upload product information
- Manage pricing
- Create product releases
- Upload release files
- View customers
- View product analytics
- Manage product lifecycle

## CUSTOMER

Customers can:

- Register/login
- Browse marketplace
- Search products
- Filter products
- View product details
- Purchase products
- View purchased products
- Access entitled products
- View releases
- Download authorized files
- Review products
- Receive notifications

## ADMIN

Admins can:

- View users
- Manage users
- View products
- Manage products
- Manage categories
- Moderate reviews
- View platform information

Use role-based authorization so users cannot access functions outside their role.

---

# 3. DEVELOPMENT PHASES

Organize the project into three development phases.

## PHASE 1: REQUIREMENT ANALYSIS

Document:

- Problem statement
- Proposed solution
- Objectives
- Target users
- Functional requirements
- Non-functional requirements
- User roles
- Module division
- Project workflow
- Basic use cases

Create a `/docs` folder containing this documentation.

Suggested files:

```text
docs/
├── requirements.md
├── functional-requirements.md
├── non-functional-requirements.md
├── module-division.md
└── project-workflow.md
```

---

# 4. PHASE 2: SYSTEM DESIGN AND BACKEND

This is the primary engineering focus.

Design and implement a modular backend.

Recommended stack:

## Frontend

- React
- TypeScript
- Vite or Next.js
- Tailwind CSS

## Backend

- Node.js
- Express.js
- TypeScript

## Database

- PostgreSQL

## Authentication

- JWT
- bcrypt

## API

- REST API

## File Storage

Use an abstraction that can work with:

- Local storage during development
- S3-compatible cloud storage later

## Real-Time

- Socket.IO

Do not introduce unnecessary microservices.

Use a clean modular monolith architecture.

---

# 5. BACKEND ARCHITECTURE

Use a structure similar to:

```text
backend/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   ├── middleware/
│   ├── validators/
│   ├── utils/
│   ├── sockets/
│   ├── app.ts
│   └── server.ts
│
├── prisma/
│   └── schema.prisma
│
├── tests/
│
├── .env.example
├── package.json
└── README.md
```

If Prisma is used with PostgreSQL, use it consistently for database access.

Do not mix multiple ORM systems.

---

# 6. MODULE DIVISION

Create clearly separated backend modules.

## Module 1: Authentication & User Management

Responsibilities:

- Registration
- Login
- Password hashing
- JWT authentication
- Role management
- Profile management

Example APIs:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
PUT  /api/users/profile
```

---

## Module 2: Product Management

Responsibilities:

- Create product
- Update product
- Delete/archive product
- Publish product
- Product status
- Product metadata

Example:

```text
POST   /api/products
GET    /api/products
GET    /api/products/:id
PUT    /api/products/:id
DELETE /api/products/:id
PATCH  /api/products/:id/publish
```

---

## Module 3: Marketplace

Responsibilities:

- Product discovery
- Search
- Filtering
- Categories
- Product details
- Sorting

Example:

```text
GET /api/marketplace/products
GET /api/marketplace/search
GET /api/categories
```

---

## Module 4: Product Release Management

Responsibilities:

- Create versions
- Release notes
- Changelog
- Release status
- Version history

Example:

```text
POST /api/products/:id/releases
GET  /api/products/:id/releases
GET  /api/releases/:id
```

Product lifecycle:

```text
DRAFT
 ↓
BETA
 ↓
PUBLISHED
 ↓
UPDATED
 ↓
ARCHIVED
```

---

## Module 5: Product File Management

Responsibilities:

- Upload product files
- Store file metadata
- Associate files with releases
- Secure file access

Do not expose private product files through publicly accessible URLs.

Use authorization before providing protected downloads.

---

## Module 6: Order & Payment

Responsibilities:

- Create order
- Order items
- Payment status
- Payment verification
- Purchase history

Example:

```text
POST /api/orders
GET  /api/orders
GET  /api/orders/:id
POST /api/payments/verify
```

Use a payment sandbox/test environment.

Do not implement real financial transactions during development.

---

## Module 7: Entitlement

This is an important module.

After successful purchase:

```text
Customer
   ↓
Order
   ↓
Payment Verified
   ↓
Entitlement Created
   ↓
Customer Gets Product Access
```

An entitlement determines whether a customer is allowed to access a product.

Example:

```text
Customer A
Product: InvoicePro
Plan: Pro
Status: Active
```

---

## Module 8: Reviews

Responsibilities:

- Add review
- Update review
- Delete review
- Rating
- Product rating calculation

Only allow eligible customers to review products.

---

## Module 9: Analytics

Track events such as:

```text
PRODUCT_VIEW
PRODUCT_PURCHASE
PRODUCT_DOWNLOAD
RELEASE_VIEW
REVIEW_CREATED
SUBSCRIPTION_STARTED
```

Creators should eventually be able to see:

- Product views
- Purchases
- Downloads
- Revenue
- Conversion information

---

## Module 10: Notifications

Support notifications such as:

- Purchase successful
- New release available
- Review received
- Subscription status changed

Use Socket.IO where real-time behavior is appropriate.

---

# 7. DATABASE DESIGN

Use PostgreSQL.

Design proper relational tables.

Core entities:

```text
User
CreatorProfile
Product
Category
ProductVersion
ProductFile
PricingPlan
Order
OrderItem
Payment
Subscription
Entitlement
Review
AnalyticsEvent
Notification
```

Important relationships:

```text
User 1 ─── N Product

Product 1 ─── N ProductVersion

ProductVersion 1 ─── N ProductFile

User 1 ─── N Order

Order 1 ─── N OrderItem

User N ─── N Product
        through Entitlement

Product 1 ─── N Review

Product 1 ─── N AnalyticsEvent
```

Create:

- ER diagram
- Database schema
- migrations
- seed data

Add realistic sample products and users.

---

# 8. API REQUIREMENTS

Create a clean REST API.

Use:

```text
/api/auth
/api/users
/api/products
/api/releases
/api/categories
/api/orders
/api/payments
/api/entitlements
/api/reviews
/api/analytics
/api/notifications
```

Every API should have:

- Input validation
- Proper HTTP status codes
- Error handling
- Authentication where required
- Authorization where required
- Consistent JSON responses

Do not put business logic directly inside route handlers.

Use:

```text
Route
 ↓
Controller
 ↓
Service
 ↓
Repository
 ↓
Database
```

---

# 9. SECURITY

Implement:

- Password hashing
- JWT authentication
- Role-based authorization
- Input validation
- Protected routes
- Environment variables
- CORS configuration
- Secure error responses
- Ownership checks
- Protected product downloads

Never hard-code:

- passwords
- JWT secrets
- database credentials
- payment keys

Create:

```text
.env.example
```

instead.

---

# 10. PHASE 3: FRONTEND DEVELOPMENT

IMPORTANT:

Before implementing the frontend, DO NOT immediately choose a design yourself.

Use **Stitch** to generate multiple UI design concepts for ProductForge.

Generate at least **3 different professional frontend design directions**.

Each design should include:

### Design A

Marketplace-focused design.

### Design B

Modern SaaS/product ecosystem design.

### Design C

Developer-focused software marketplace design.

All designs should be appropriate for a final-year engineering project and should look like a real software platform.

---

# 11. STITCH DESIGN REQUIREMENTS

Generate Stitch designs for:

### Customer

- Landing/Home page
- Marketplace
- Product listing
- Product details
- Login/Register
- Checkout
- Customer dashboard
- My Products
- Product access page
- Notifications

### Creator

- Creator dashboard
- My Products
- Create Product
- Edit Product
- Product lifecycle
- Release management
- Analytics
- Customer management

### Admin

- Admin dashboard
- User management
- Product management
- Category management

The designs should use one consistent design system.

Include:

- Navigation
- Cards
- Buttons
- Forms
- Tables
- Modals
- Status badges
- Charts
- Empty states
- Loading states
- Error states
- Responsive layouts

---

# 12. IMPORTANT STITCH WORKFLOW

Do this in two stages.

## STAGE 1: DESIGN SELECTION

Generate the 3 Stitch design concepts.

DO NOT start implementing the final frontend yet.

Show the designs clearly and label them:

```text
Design A
Design B
Design C
```

Wait for the developer/user to select one.

## STAGE 2: IMPLEMENTATION

After the user selects one Stitch design:

Use the selected Stitch design as the visual reference.

Implement the React frontend based on that design.

Do not redesign the interface independently unless required for functionality.

Maintain:

- Same layout structure
- Similar spacing
- Typography hierarchy
- Navigation style
- Component style
- Card structure
- Dashboard structure
- Color system
- Responsive behavior

---

# 13. FRONTEND IMPLEMENTATION

After a Stitch design has been selected, implement:

```text
src/
├── components/
├── pages/
├── layouts/
├── hooks/
├── services/
├── contexts/
├── types/
├── utils/
└── assets/
```

Create reusable components.

Examples:

```text
Navbar
Sidebar
ProductCard
ProductGrid
ProductDetails
ProductForm
ReleaseCard
ReviewCard
AnalyticsCard
DataTable
Modal
Toast
Button
Input
```

Do not duplicate UI code unnecessarily.

---

# 14. FRONTEND-BACKEND INTEGRATION

The frontend must actually communicate with the backend.

Do not create fake static pages.

For example:

```text
React Login
      ↓
POST /api/auth/login
      ↓
Backend
      ↓
PostgreSQL
      ↓
JWT
      ↓
React Dashboard
```

Similarly:

```text
Creator
 ↓
Create Product Form
 ↓
POST /api/products
 ↓
Backend
 ↓
PostgreSQL
 ↓
Marketplace
 ↓
Customer sees product
```

The core frontend should demonstrate real data flow.

---

# 15. DEMO WORKFLOW

The final working demonstration should be capable of showing:

### Creator

1. Login
2. Open creator dashboard
3. Create a product
4. Add product information
5. Publish product
6. View product

### Customer

1. Login
2. Browse marketplace
3. Search product
4. Open product
5. Purchase/test purchase
6. View product in customer library

### Product Lifecycle

1. Creator opens product
2. Creates Version 1.0
3. Publishes release
4. Creates Version 1.1
5. Customer can see the new release

This should be a real database-backed workflow.

---

# 16. GITHUB REQUIREMENTS

Create a clean GitHub repository.

Suggested structure:

```text
ProductForge/
│
├── frontend/
├── backend/
├── database/
├── docs/
│   ├── requirements/
│   ├── architecture/
│   ├── database/
│   ├── dfd/
│   └── uml/
│
├── README.md
├── .gitignore
└── LICENSE
```

The README should contain:

- Project overview
- Problem statement
- Features
- Architecture
- Technology stack
- Installation
- Environment variables
- Database setup
- API information
- Team members
- Module responsibilities
- Screenshots
- Future scope

Use meaningful commits.

Do not make one person commit the entire project.

Each team member must contribute to their assigned module.

---

# 17. TEAM CONTRIBUTION

Create a section in the README:

```text
Team Member 1
Module: Authentication & User Management

Team Member 2
Module: Product Management & Marketplace

Team Member 3
Module: Release Management & File Storage

Team Member 4
Module: Orders, Payments & Entitlements

Team Member 5
Module: Analytics, Reviews & Notifications
```

The actual assignments can be changed according to the team.

Each member must understand:

- Their database tables
- Their APIs
- Their backend logic
- Their frontend integration
- Their GitHub commits
- Their module's purpose

---

# 18. DOCUMENTATION

Create documentation for:

```text
docs/
├── requirements.md
├── architecture.md
├── database.md
├── api.md
├── module-division.md
├── setup.md
└── development-phases.md
```

Also create diagrams:

- High-Level System Architecture
- ER Diagram
- DFD Level 0
- DFD Level 1
- Use Case Diagram
- Important Sequence Diagrams

---

# 19. DEVELOPMENT RULES

Follow these rules throughout development:

1. Do not build everything at once.
2. Complete backend foundation before advanced features.
3. Keep modules separated.
4. Use PostgreSQL as the source of truth.
5. Do not use fake data once backend APIs are available.
6. Do not hard-code secrets.
7. Validate all important inputs.
8. Handle errors properly.
9. Use reusable frontend components.
10. Keep the GitHub repository organized.
11. Write documentation while developing.
12. Keep the system understandable enough for a university viva.
13. Avoid unnecessary microservices.
14. Avoid unnecessary AI features.
15. Do not add features just to make the project look larger.

---

# 20. PRIORITY ORDER

Implement in this order:

### Priority 1

Project setup  
GitHub  
Backend structure  
Database  
Authentication

### Priority 2

User roles  
Product management  
Marketplace  
Search/filter

### Priority 3

Product versions  
Release management  
Cloud file handling

### Priority 4

Orders  
Payments  
Entitlements  
Customer library

### Priority 5

Reviews  
Analytics  
Notifications  
Real-time functionality

### Priority 6

Testing  
Security hardening  
Deployment  
Documentation

---

# 21. QUALITY REQUIREMENTS

The final application should:

- Run without critical errors
- Have a responsive UI
- Have working backend APIs
- Have a connected PostgreSQL database
- Have authentication
- Have role-based authorization
- Have meaningful validation
- Have proper error handling
- Have realistic seed data
- Have clean code structure
- Have GitHub documentation
- Have a working creator workflow
- Have a working customer workflow

Do not claim a feature is completed unless it actually works.

---

# 22. FIRST ACTION

Before writing the complete frontend:

1. Analyze the ProductForge requirements.
2. Create the backend architecture.
3. Create the database schema.
4. Create the initial project structure.
5. Create the requirement and system-design documentation.
6. Generate **three different Stitch frontend design concepts**.
7. Present the three designs for selection.
8. STOP frontend implementation until one design is selected.
9. After selection, implement that Stitch design in React.
10. Connect the frontend to the backend APIs.

The final goal is a working, GitHub-ready, full-stack ProductForge project that demonstrates **Requirement Analysis + System Design + Backend Engineering + React Frontend + Team Module Development + GitHub Collaboration**.

Do not over-engineer the system. Prioritize a working end-to-end product flow over a large number of incomplete features.