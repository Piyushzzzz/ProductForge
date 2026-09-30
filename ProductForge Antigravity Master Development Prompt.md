# PRODUCTFORGE: CREATOR CONTROL CENTER + GITHUB INTEGRATION

## PROJECT

Build the missing Creator-side functionality of:

**ProductForge: Cloud-Based Digital Product Marketplace and Lifecycle Management Platform**

The current project does not yet have a complete Creator Dashboard, Creator Product Management system, pricing controls, product file upload, release management, or GitHub repository integration.

Implement these features from scratch and integrate them into the existing ProductForge architecture.

Do NOT create only static frontend screens.

Everything must be connected to the backend, database, authentication, and APIs.

---

# 1. MAIN OBJECTIVE

The Creator must have complete control over the software products they create on ProductForge.

After logging in, a creator must be able to:

```text
Login
 ↓
Creator Dashboard
 ↓
My Products
 ↓
Create / Edit / Manage Product
 ↓
Connect GitHub Repository
 ↓
Set Pricing
 ↓
Upload Product / Release Files
 ↓
Create Releases
 ↓
Publish Product
 ↓
Manage Customers
 ↓
View Orders
 ↓
View Analytics
```

The Creator Dashboard must display the **actual products belonging to the authenticated creator**.

Do NOT display hard-coded products.

---

# 2. CREATOR DASHBOARD

Create a dedicated Creator Dashboard.

Route:

```text
/creator/dashboard
```

The dashboard should contain:

### Summary Cards

* Total Products
* Published Products
* Total Customers
* Total Orders
* Total Revenue
* Downloads

These values must come from backend APIs.

Example:

```text
Products       5
Published      3
Customers      248
Orders         315
Revenue        ₹82,450
Downloads      1,240
```

---

# 3. MY PRODUCTS

Create:

```text
/creator/products
```

This is the most important creator page.

It must retrieve products using the authenticated creator ID.

API:

```http
GET /api/creator/products
```

The backend must identify the authenticated creator from the JWT/session.

Do NOT allow a creator to retrieve another creator's products.

Display each product as a card or table.

Example:

```text
┌──────────────────────────────────────────────┐
│ InvoicePro                    ● Published    │
│ Invoice management software                 │
│ Version: v2.1.0                             │
│ Customers: 245                              │
│ Revenue: ₹45,200                             │
│                                              │
│ [Manage] [Releases] [Pricing] [View]         │
└──────────────────────────────────────────────┘
```

Also provide:

```text
[ + Create New Product ]
```

---

# 4. CREATE PRODUCT

Create:

```text
/creator/products/new
```

The creator must be able to create a real database record.

Fields:

* Product Name
* Short Description
* Full Description
* Product Type
* Category
* Logo
* Banner
* Screenshots
* Demo URL
* Documentation URL
* GitHub Repository
* Product Status

Product types:

```text
SaaS
Desktop Software
Browser Extension
API
Plugin
Developer Tool
CLI Tool
SDK
Template
Starter Kit
Other Software
```

Initial status:

```text
DRAFT
```

Buttons:

```text
[ Save Draft ]
[ Continue ]
```

---

# 5. PRODUCT EDITING

Create:

```text
/creator/products/:productId/edit
```

Only the creator who owns the product can edit it.

The backend must perform ownership validation.

Never rely only on frontend hiding.

The backend must reject unauthorized access.

Example:

```text
Creator A
   ↓
InvoicePro
   ↓
Allowed ✓

Creator B
   ↓
InvoicePro
   ↓
403 Forbidden
```

---

# 6. PRODUCT CONTROL CENTER

Every creator product needs its own control center.

Route:

```text
/creator/products/:productId
```

Navigation:

```text
Overview
Product
Pricing
Releases
GitHub
Files
Customers
Orders
Analytics
Settings
```

Header:

```text
InvoicePro
● Published

v2.1.0
245 Customers
₹45,200 Revenue

[ Edit Product ]
[ New Release ]
[ Change Pricing ]
```

---

# 7. PRODUCT STATUS

Implement product lifecycle states:

```text
DRAFT
BETA
PUBLISHED
UNPUBLISHED
ARCHIVED
```

Allow valid state transitions.

Example:

```text
DRAFT
 ↓
BETA
 ↓
PUBLISHED
 ↓
UNPUBLISHED
 ↓
ARCHIVED
```

The creator should have appropriate actions:

```text
[ Publish ]
[ Unpublish ]
[ Archive ]
```

Do not allow invalid transitions.

---

# 8. PRICING MANAGEMENT

Create:

```text
/creator/products/:productId/pricing
```

The creator must be able to decide how the product is sold.

Pricing models:

```text
FREE
ONE_TIME
SUBSCRIPTION
```

Support:

### Free

```text
Price: ₹0
```

### One-Time Purchase

```text
Price:
₹999

Currency:
INR
```

### Subscription

Allow:

```text
Monthly
Yearly
```

Example:

```text
Pro
₹499 / month

Business
₹1,499 / month
```

Creator controls:

* Create pricing plan
* Edit pricing plan
* Disable plan
* Change price
* Change currency
* Set billing interval
* Set trial period if implemented

All pricing information must be stored in PostgreSQL.

---

# 9. PRODUCT FILE UPLOAD

Create product file management.

Route:

```text
/creator/products/:productId/files
```

Creators may upload:

* Software installers
* ZIP packages
* Application packages
* Documentation
* Product assets

Do not store large binary files directly inside PostgreSQL.

Use object/cloud storage.

Architecture:

```text
Creator
 ↓
Frontend
 ↓
Backend
 ↓
Cloud/Object Storage
 ↓
File URL / Storage Key
 ↓
PostgreSQL Metadata
```

Database stores:

```text
file_id
product_id
release_id
file_name
file_size
mime_type
storage_key
created_at
```

---

# 10. RELEASE MANAGEMENT

Create:

```text
/creator/products/:productId/releases
```

Display:

```text
InvoicePro Releases

v2.1.0   Current
v2.0.0
v1.5.0
v1.0.0

[ + Create Release ]
```

Create release:

```text
Version:
2.2.0

Release Name:
Performance Update

Release Notes:
...

Compatibility:
☑ Windows
☑ macOS
☑ Linux

GitHub Release:
[ Select / Sync ]

Product Files:
[ Upload ]

[ Save Draft ]
[ Publish Release ]
```

Store:

```text
ProductRelease
```

with:

```text
id
product_id
version
release_name
release_notes
status
github_release_id
release_url
published_at
created_at
```

---

# 11. GITHUB INTEGRATION

This is a core feature.

The creator should be able to connect their GitHub account.

Use:

**GitHub OAuth**

Do NOT ask users to enter their GitHub password.

Do NOT store raw GitHub passwords.

After authorization, retrieve repositories that the creator is authorized to access.

---

# 12. GITHUB CONNECTION PAGE

Create:

```text
/creator/products/:productId/github
```

Initial state:

```text
Connect your GitHub repository

Connect your GitHub account to associate
this software product with its source repository.

[ Connect GitHub ]
```

After successful connection:

```text
GitHub Connected ✓

Repositories

Search repositories...

invoice-pro
developer-tools
task-manager

[ Select Repository ]
```

The creator selects one repository.

---

# 13. STORE GITHUB REPOSITORY

After selection, associate the repository with the ProductForge product.

Example:

```text
Product:
InvoicePro

GitHub Repository:
developer/invoice-pro

Repository URL:
https://github.com/developer/invoice-pro

Connection:
Connected ✓

Latest Release:
v2.1.0

Last Synced:
Today
```

Database should store repository metadata, not source code.

Suggested fields:

```text
github_repository_id
github_owner
github_repository
github_url
github_default_branch
github_visibility
github_connected_at
last_synced_at
```

---

# 14. GITHUB RELEASE SYNCHRONIZATION

ProductForge should retrieve release information from the connected repository.

Example:

GitHub:

```text
v1.0.0
v1.1.0
v2.0.0
v2.1.0
```

ProductForge displays:

```text
Available GitHub Releases

v2.1.0
v2.0.0
v1.1.0
v1.0.0
```

Creator can choose:

```text
[ Sync Release ]
```

or:

```text
[ Import Release ]
```

The imported release should create a ProductForge ProductRelease record.

---

# 15. IMPORTANT GITHUB DISTINCTION

Do NOT treat GitHub as ProductForge's entire version-control system.

GitHub manages:

* Source code
* Commits
* Branches
* Pull requests
* Technical releases

ProductForge manages:

* Product listing
* Pricing
* Marketplace
* Purchases
* Customer access
* Product entitlements
* Commercial product releases
* Customers
* Orders
* Analytics

Therefore:

```text
GitHub
   ↓
Technical Source + Release Information
   ↓
ProductForge
   ↓
Commercial Product
   ↓
Customers
```

Do NOT expose a private repository's source code to customers.

---

# 16. MANUAL GITHUB SYNC

Implement a fallback:

```text
[ Sync GitHub ]
```

When clicked:

```text
ProductForge
 ↓
GitHub API
 ↓
Fetch repository
 ↓
Fetch releases
 ↓
Update ProductRelease
 ↓
Update latest version
 ↓
Return sync result
```

Display:

```text
✓ GitHub synchronized successfully

Latest release:
v2.1.0

3 releases synchronized
```

---

# 17. GITHUB WEBHOOK

If feasible, add webhook support.

When GitHub creates a new release:

```text
GitHub
 ↓
Webhook
 ↓
ProductForge
 ↓
Verify event
 ↓
Update release
 ↓
Notify creator
```

However, manual synchronization must remain available.

Do not make webhook implementation a blocker for the MVP.

---

# 18. CREATOR CUSTOMERS

Create:

```text
/creator/products/:productId/customers
```

Display:

```text
Customer       Plan       Status      Joined
------------------------------------------------
Rahul          Pro        Active      Aug 12
Aman           Basic      Active      Aug 10
Priya          Pro        Active      Aug 08
```

Creator can see:

* Customer name
* Product
* Plan
* Purchase date
* Access status
* Subscription status

Do not display sensitive payment information.

---

# 19. CREATOR ORDERS

Create:

```text
/creator/orders
```

Show:

```text
Order #1023
InvoicePro
₹999
Completed
Aug 24

Order #1022
DevAPI Pro
₹499
Completed
Aug 23
```

Filter:

* Product
* Status
* Date

---

# 20. CREATOR ANALYTICS

Create:

```text
/creator/analytics
```

Display:

```text
Total Views
Total Customers
Total Orders
Revenue
Downloads
Conversion Rate
```

For each product:

```text
InvoicePro

Views: 12,450
Purchases: 245
Downloads: 1,240
Revenue: ₹45,200
```

Use real database analytics where available.

---

# 21. CREATOR NAVIGATION

The final sidebar should contain:

```text
Creator Dashboard

Overview

My Products
  ├── All Products
  └── Create Product

Releases

Orders

Customers

Analytics

GitHub

Settings
```

The creator should never need to leave the creator dashboard to control their products.

---

# 22. BACKEND APIs

Implement APIs similar to:

### Creator

```http
GET    /api/creator/dashboard
GET    /api/creator/products
POST   /api/creator/products
GET    /api/creator/products/:id
PUT    /api/creator/products/:id
DELETE /api/creator/products/:id
PATCH  /api/creator/products/:id/status
```

### Pricing

```http
GET    /api/products/:id/pricing
POST   /api/products/:id/pricing
PUT    /api/products/:id/pricing/:planId
DELETE /api/products/:id/pricing/:planId
```

### Releases

```http
GET    /api/products/:id/releases
POST   /api/products/:id/releases
PUT    /api/releases/:releaseId
DELETE /api/releases/:releaseId
POST   /api/products/:id/releases/:releaseId/publish
```

### Files

```http
POST   /api/products/:id/files
GET    /api/products/:id/files
DELETE /api/files/:fileId
```

### GitHub

```http
GET    /api/github/connect
GET    /api/github/callback
GET    /api/github/repositories
POST   /api/github/products/:productId/connect
POST   /api/github/products/:productId/sync
DELETE /api/github/products/:productId/disconnect
GET    /api/github/products/:productId/releases
```

### Customers

```http
GET /api/creator/products/:id/customers
```

### Orders

```http
GET /api/creator/orders
```

### Analytics

```http
GET /api/creator/analytics
GET /api/creator/products/:id/analytics
```

---

# 23. DATABASE ADDITIONS

Make sure the database supports all creator functionality.

Required entities:

```text
User
CreatorProfile
Product
Category
PricingPlan
ProductVersion
ProductFile
GitHubConnection
GitHubRepository
Order
OrderItem
Payment
Subscription
Entitlement
Review
AnalyticsEvent
Notification
```

Important relationship:

```text
Creator
   ↓
Product
   ↓
GitHubRepository
   ↓
GitHub Releases
   ↓
ProductRelease
```

---

# 24. FRONTEND REQUIREMENTS

Create all creator pages using the selected Stitch design.

Required pages:

```text
/creator/dashboard
/creator/products
/creator/products/new
/creator/products/:id
/creator/products/:id/edit
/creator/products/:id/pricing
/creator/products/:id/releases
/creator/products/:id/files
/creator/products/:id/github
/creator/products/:id/customers
/creator/orders
/creator/analytics
```

Do not make these static pages.

Every page must use backend APIs.

---

# 25. PRODUCT OWNERSHIP SECURITY

This is mandatory.

Every creator request involving a product must verify ownership.

For example:

```text
GET /api/creator/products/123
```

Backend:

```text
Authenticated User
       ↓
Find Product 123
       ↓
Check product.creator_id
       ↓
Compare with authenticated user.id
       ↓
Allowed / Forbidden
```

Never trust a creator ID supplied by the frontend.

---

# 26. FRONTEND UX

The Creator Dashboard should feel like a real product-management platform.

Include:

* Sidebar
* Top navigation
* Product cards
* Status badges
* Tables
* Charts
* Forms
* Modals
* Confirmation dialogs
* Toast messages
* Loading states
* Empty states
* Error states

Example empty state:

```text
You haven't created any products yet.

Create your first software product and start
selling it through ProductForge.

[ + Create Product ]
```

---

# 27. STITCH DESIGN

Before implementing the frontend, generate three Stitch design options specifically for the **Creator Experience**.

### Design A

Developer-focused dashboard.

### Design B

Modern SaaS creator control center.

### Design C

Product lifecycle-focused creator workspace.

Each design must include:

* Creator Dashboard
* My Products
* Create Product
* Product Control Center
* Pricing
* Releases
* GitHub Integration
* Customers
* Orders
* Analytics

Do NOT implement the frontend before a design is selected.

Generate the three Stitch options and wait for selection.

After selection, implement the selected design faithfully.

---

# 28. TEAM GITHUB REPOSITORY

This is separate from the GitHub integration inside ProductForge.

The university project repository should contain:

```text
ProductForge/
│
├── frontend/
├── backend/
├── database/
├── docs/
├── README.md
├── .gitignore
└── .env.example
```

Add all team members as collaborators.

Use feature branches:

```text
feature/creator-dashboard
feature/product-management
feature/github-integration
feature/release-management
feature/pricing
```

Do not let every developer directly modify `main`.

Use:

```text
feature branch
      ↓
commit
      ↓
pull request
      ↓
review
      ↓
merge
```

---

# 29. TEAM CONTRIBUTION

Assign modules clearly.

Example:

```text
Member 1
Authentication + Creator Dashboard

Member 2
Product Management + Pricing

Member 3
GitHub Integration + Release Management

Member 4
Marketplace + Customer Library

Member 5
Orders + Payments + Entitlements
```

Change assignments according to the actual team.

Each member must have meaningful commits and understand their module for the CA-II evaluation.

---

# 30. SECURITY

Implement:

* JWT authentication
* Role-based authorization
* Product ownership validation
* GitHub OAuth
* Secure token handling
* Input validation
* Rate limiting where appropriate
* CORS
* Environment variables
* No secrets in GitHub
* Protected file downloads
* Proper API error handling

Never commit:

```text
.env
GitHub secrets
Payment secrets
Database passwords
JWT secrets
```

Use:

```text
.env.example
```

---

# 31. END-TO-END CREATOR DEMO

The final working flow must demonstrate:

```text
Creator Login
     ↓
Creator Dashboard
     ↓
My Products
     ↓
Create Product
     ↓
Enter Product Information
     ↓
Connect GitHub
     ↓
Select Repository
     ↓
Set Pricing
     ↓
Upload Product/Release File
     ↓
Create Release
     ↓
Publish Product
     ↓
Product Appears in Marketplace
     ↓
Customer Purchases
     ↓
Creator Sees Customer + Order
     ↓
Developer Creates New GitHub Release
     ↓
ProductForge Syncs Release
     ↓
Creator Publishes Update
     ↓
Customer Gets New Version
```

This complete workflow is the target.

---

# 32. IMPORTANT IMPLEMENTATION RULE

Do not create a fake dashboard containing:

```text
Products: 10
Sales: 250
Revenue: ₹50,000
```

unless those values come from the database.

Everything must be real:

```text
Database
 ↓
Backend API
 ↓
React
 ↓
Creator Dashboard
```

If the creator has no products, show an empty state.

If the creator creates a product, it must immediately appear in **My Products** after successful API/database creation.

---

# 33. BUILD ORDER

Implement in this exact order:

### Step 1

Inspect the existing ProductForge project.

### Step 2

Do not destroy existing working functionality.

### Step 3

Check current database schema.

### Step 4

Add missing creator/product entities.

### Step 5

Implement creator authentication/ownership middleware.

### Step 6

Implement Product CRUD.

### Step 7

Implement Creator Dashboard.

### Step 8

Implement My Products.

### Step 9

Implement Product Control Center.

### Step 10

Implement Pricing Management.

### Step 11

Implement Product File Management.

### Step 12

Implement Release Management.

### Step 13

Implement GitHub OAuth.

### Step 14

Implement GitHub repository selection.

### Step 15

Implement GitHub release synchronization.

### Step 16

Implement Customers and Orders.

### Step 17

Implement Analytics.

### Step 18

Connect all frontend pages to backend APIs.

### Step 19

Test creator ownership/security.

### Step 20

Update GitHub documentation.

---

# FINAL ACCEPTANCE CRITERIA

The feature is complete only when all of the following work:

* Creator can register/login.
* Creator can access creator dashboard.
* Creator can see only their own products.
* Creator can create a product.
* Creator can edit a product.
* Creator can publish/unpublish/archive a product.
* Creator can set pricing.
* Creator can upload product/release files.
* Creator can create releases.
* Creator can connect GitHub.
* Creator can select an authorized repository.
* ProductForge stores the repository association.
* ProductForge can retrieve GitHub releases.
* Creator can synchronize GitHub releases.
* Creator can view customers.
* Creator can view orders.
* Creator can view product analytics.
* Product appears in the marketplace after publication.
* Customer can purchase the product.
* Customer receives an entitlement.
* Creator can see the resulting customer/order.
* Product release updates can be synchronized.
* All creator actions are protected by authentication and ownership authorization.
* Frontend uses the selected Stitch design.
* Backend APIs are actually connected to the frontend.
* No sensitive secrets are committed to GitHub.
* Project documentation is updated.
* Team members have meaningful GitHub contributions.

Prioritize a **working end-to-end creator workflow** over adding many incomplete features.
