import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting ProductForge database seeding...');

  // Ensure uploads directory exists with dummy binary packages
  const uploadDir = './uploads';
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const invoiceProZip = path.join(uploadDir, 'invoicepro-v1.2.0.zip');
  if (!fs.existsSync(invoiceProZip)) {
    fs.writeFileSync(invoiceProZip, 'PK\x03\x04ProductForge Binary Package Payload: InvoicePro v1.2.0');
  }

  const devToolkitZip = path.join(uploadDir, 'devtoolkit-api-v2.0.0.zip');
  if (!fs.existsSync(devToolkitZip)) {
    fs.writeFileSync(devToolkitZip, 'PK\x03\x04ProductForge Binary Package Payload: DevToolkit API v2.0.0');
  }

  const forgeFlowZip = path.join(uploadDir, 'forgeflow-cli-v1.0.0.zip');
  if (!fs.existsSync(forgeFlowZip)) {
    fs.writeFileSync(forgeFlowZip, 'PK\x03\x04ProductForge Binary Package Payload: ForgeFlow CLI v1.0.0');
  }

  // 1. Seed Categories
  const categoriesData = [
    { name: 'SaaS Platforms', slug: 'saas', icon: 'Cloud', description: 'Production-ready cloud software and SaaS boilerplates' },
    { name: 'APIs & Microservices', slug: 'apis', icon: 'Server', description: 'High-performance REST & GraphQL APIs, middleware, and SDKs' },
    { name: 'CLI & Dev Tools', slug: 'cli-tools', icon: 'Terminal', description: 'Command-line utilities, workflow automations, and dev-scripts' },
    { name: 'UI Kits & Components', slug: 'ui-kits', icon: 'Layout', description: 'Tailwind, React, and Figma component design systems' },
    { name: 'Plugins & Extensions', slug: 'plugins', icon: 'Puzzle', description: 'Browser extensions, IDE plugins, and CMS integrations' },
    { name: 'Templates & Starters', slug: 'templates', icon: 'Box', description: 'Full-stack templates, Next.js starters, and clean architectures' }
  ];

  const categoriesMap: Record<string, any> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      create: cat,
      update: cat
    });
    categoriesMap[cat.slug] = created;
  }

  // 2. Seed Users
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@productforge.io' },
    create: {
      email: 'admin@productforge.io',
      passwordHash,
      name: 'Forge Administrator',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    update: {}
  });

  const creator1 = await prisma.user.upsert({
    where: { email: 'alex@forgeflow.dev' },
    create: {
      email: 'alex@forgeflow.dev',
      passwordHash,
      name: 'Alex Rivera',
      role: 'CREATOR',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      creatorProfile: {
        create: {
          bio: 'Full-stack SaaS architect & open-source enthusiast with 10+ years experience building fintech products.',
          website: 'https://alexrivera.dev',
          githubUrl: 'https://github.com/alexrivera',
          rating: 4.9,
          totalSales: 3840.0
        }
      }
    },
    update: {}
  });

  const creator2 = await prisma.user.upsert({
    where: { email: 'maria@devtoolkit.io' },
    create: {
      email: 'maria@devtoolkit.io',
      passwordHash,
      name: 'Maria Chen',
      role: 'CREATOR',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      creatorProfile: {
        create: {
          bio: 'Backend systems engineer specializing in high-throughput APIs, GraphQL federations, and developer SDKs.',
          website: 'https://mariachen.io',
          githubUrl: 'https://github.com/mariachen',
          rating: 4.8,
          totalSales: 2150.0
        }
      }
    },
    update: {}
  });

  const customer1 = await prisma.user.upsert({
    where: { email: 'jordan@buyer.com' },
    create: {
      email: 'jordan@buyer.com',
      passwordHash,
      name: 'Jordan Smith',
      role: 'CUSTOMER',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'
    },
    update: {}
  });

  // 3. Seed Products
  const invoicePro = await prisma.product.upsert({
    where: { slug: 'invoicepro-cloud-billing' },
    create: {
      creatorId: creator1.id,
      categoryId: categoriesMap['saas'].id,
      title: 'InvoicePro Billing & Invoicing SaaS',
      slug: 'invoicepro-cloud-billing',
      tagline: 'Complete multi-tenant SaaS billing platform with Stripe, automated PDF generation, and client portal.',
      description: `### Product Overview
**InvoicePro** is a comprehensive, production-grade billing and subscription platform engineered in TypeScript, React, and Node.js.

#### Key Features:
- 💳 Multi-currency Stripe & PayPal checkout integration
- 📄 Automated PDF invoice generation with headless Chromium
- 👥 Multi-tenant organization workspace support
- 📊 Real-time MRR and ARR revenue analytics dashboard
- 🔐 RBAC with granular staff permission levels`,
      status: 'PUBLISHED',
      demoUrl: 'https://invoicepro-demo.productforge.io',
      githubRepo: 'https://github.com/forgeflow/invoicepro-demo',
      logoUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
      averageRating: 4.9,
      totalReviews: 28,
      totalPurchases: 42,
      pricingPlans: {
        create: [
          {
            name: 'Standard License',
            type: 'ONE_TIME',
            price: 49.0,
            interval: 'NONE',
            features: JSON.stringify(['Single Production Domain', '1 Year Free Version Updates', 'Full TypeScript Source Code', 'Standard Discord Support'])
          },
          {
            name: 'Extended Team License',
            type: 'ONE_TIME',
            price: 149.0,
            interval: 'NONE',
            features: JSON.stringify(['Unlimited Production Domains', 'Lifetime Version Releases', 'Full Source Code + Figma UI Kit', 'Priority 1-on-1 Support'])
          }
        ]
      },
      versions: {
        create: [
          {
            versionNumber: 'v1.2.0',
            releaseTitle: 'Performance Optimization & Webhooks v2',
            releaseNotes: 'Introduces idempotent Stripe webhook handling, 40% faster PDF render pipeline, and Next.js 14 App Router upgrade.',
            changelog: '- ✨ Added Webhook idempotency engine\n- ⚡ 40% faster PDF generation using workers\n- 🛠️ Upgraded to Next.js 14 and Tailwind CSS v3.4\n- 🐛 Fixed tax rounding edge case on EUR currencies',
            isBeta: false,
            isCurrent: true,
            files: {
              create: [
                {
                  fileName: 'invoicepro-v1.2.0.zip',
                  fileSize: 14850000,
                  mimeType: 'application/zip',
                  storagePath: invoiceProZip,
                  checksum: crypto.createHash('sha256').update('PKInvoicePro1.2').digest('hex')
                }
              ]
            }
          },
          {
            versionNumber: 'v1.1.0',
            releaseTitle: 'Multi-Currency & Custom Themes',
            releaseNotes: 'Initial release supporting multi-currency billing and dark mode invoice templates.',
            changelog: '- Added 30+ international currencies\n- Custom CSS branding support for client portal',
            isBeta: false,
            isCurrent: false
          }
        ]
      }
    },
    update: {}
  });

  const devToolkit = await prisma.product.upsert({
    where: { slug: 'devtoolkit-unified-api' },
    create: {
      creatorId: creator2.id,
      categoryId: categoriesMap['apis'].id,
      title: 'DevToolkit Unified Authentication & Cache API',
      slug: 'devtoolkit-unified-api',
      tagline: 'High-performance microservice API for multi-provider OAuth, Redis caching, and rate limiting.',
      description: `### DevToolkit API
A battle-tested backend microservice providing plug-and-play authentication, Redis distributed caching, token refresh mechanics, and granular IP-based rate limiting.`,
      status: 'PUBLISHED',
      demoUrl: 'https://api-docs.devtoolkit.io',
      githubRepo: 'https://github.com/devtoolkit/core-api',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      averageRating: 4.8,
      totalReviews: 19,
      totalPurchases: 31,
      pricingPlans: {
        create: [
          {
            name: 'Developer Tier',
            type: 'ONE_TIME',
            price: 39.0,
            interval: 'NONE',
            features: JSON.stringify(['Docker Compose Setup', 'Full Node.js & Go Source', 'Redis & Postgres Adapters', '6 Months Updates'])
          }
        ]
      },
      versions: {
        create: [
          {
            versionNumber: 'v2.0.0',
            releaseTitle: 'Go 1.22 & Rust Bridge Integration',
            releaseNotes: 'Major rewrite with sub-millisecond JWT verification and dynamic Redis clustering.',
            changelog: '- 🚀 Sub-millisecond JWT caching with Redis pipeline\n- 🛡️ IP Rate Limiter with Token Bucket algorithm\n- 📦 Added Go & Node.js client SDK packages',
            isBeta: false,
            isCurrent: true,
            files: {
              create: [
                {
                  fileName: 'devtoolkit-api-v2.0.0.zip',
                  fileSize: 8920000,
                  mimeType: 'application/zip',
                  storagePath: devToolkitZip,
                  checksum: crypto.createHash('sha256').update('PKDevToolkit2.0').digest('hex')
                }
              ]
            }
          }
        ]
      }
    },
    update: {}
  });

  const forgeFlow = await prisma.product.upsert({
    where: { slug: 'forgeflow-cli-automation' },
    create: {
      creatorId: creator1.id,
      categoryId: categoriesMap['cli-tools'].id,
      title: 'ForgeFlow CLI - Full-Stack Monorepo Automator',
      slug: 'forgeflow-cli-automation',
      tagline: 'Supercharged terminal CLI tool to scaffold microservices, manage database migrations, and streamline CI/CD.',
      description: `### ForgeFlow CLI
Streamline terminal workflows with instant monorepo scaffolding, dockerized environment spawning, and automated database migrations.`,
      status: 'BETA',
      demoUrl: '',
      githubRepo: 'https://github.com/forgeflow/cli',
      logoUrl: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&auto=format&fit=crop&q=80',
      averageRating: 4.7,
      totalReviews: 8,
      totalPurchases: 14,
      pricingPlans: {
        create: [
          {
            name: 'Personal CLI License',
            type: 'ONE_TIME',
            price: 19.0,
            interval: 'NONE',
            features: JSON.stringify(['Cross-platform CLI binary (macOS, Linux, Windows)', 'Automatic Update Channel', 'Plugin SDK Access'])
          }
        ]
      },
      versions: {
        create: [
          {
            versionNumber: 'v1.0.0-beta.2',
            releaseTitle: 'Beta Scaffolder Release',
            releaseNotes: 'Includes Turborepo & Vite templates with zero-config Docker generation.',
            changelog: '- Initial beta release for early adopters\n- Added Next.js and Express templates',
            isBeta: true,
            isCurrent: true,
            files: {
              create: [
                {
                  fileName: 'forgeflow-cli-v1.0.0.zip',
                  fileSize: 4200000,
                  mimeType: 'application/zip',
                  storagePath: forgeFlowZip,
                  checksum: crypto.createHash('sha256').update('PKForgeFlow1.0').digest('hex')
                }
              ]
            }
          }
        ]
      }
    },
    update: {}
  });

  // 4. Seed Entitlement for Jordan on InvoicePro
  const invoiceProPlans = await prisma.pricingPlan.findMany({ where: { productId: invoicePro.id } });
  if (invoiceProPlans.length > 0) {
    const existingEntitlement = await prisma.entitlement.findFirst({
      where: { customerId: customer1.id, productId: invoicePro.id }
    });

    if (!existingEntitlement) {
      const order = await prisma.order.create({
        data: {
          customerId: customer1.id,
          orderNumber: 'ORD-DEMO-001',
          totalAmount: invoiceProPlans[0].price,
          status: 'COMPLETED',
          items: {
            create: {
              productId: invoicePro.id,
              pricingPlanId: invoiceProPlans[0].id,
              price: invoiceProPlans[0].price
            }
          },
          payment: {
            create: {
              transactionId: 'TXN-DEMO-991A',
              provider: 'SANDBOX',
              status: 'COMPLETED',
              amount: invoiceProPlans[0].price
            }
          }
        },
        include: { items: true }
      });

      await prisma.entitlement.create({
        data: {
          customerId: customer1.id,
          productId: invoicePro.id,
          orderItemId: order.items[0].id,
          licenseKey: 'PF-8F03-A265-57BB-3A0A',
          status: 'ACTIVE'
        }
      });

      // Add verified review
      await prisma.review.create({
        data: {
          customerId: customer1.id,
          productId: invoicePro.id,
          rating: 5,
          comment: 'Outstanding software architecture! Saved our team at least 3 months of backend development. Clean TypeScript code and great release notes.'
        }
      });
    }
  }

  // 5. Seed Welcome Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: customer1.id,
        title: 'Welcome to ProductForge!',
        message: 'Explore curated software, SaaS templates, and dev-tools built by modern creators.',
        type: 'INFO',
        linkUrl: '/marketplace'
      },
      {
        userId: creator1.id,
        title: 'New Product Published',
        message: 'InvoicePro Billing & Invoicing SaaS is now live on the marketplace.',
        type: 'SUCCESS',
        linkUrl: '/creator/products'
      }
    ]
  });

  console.log('✅ ProductForge database seeded successfully!');
  console.log('👤 Admin: admin@productforge.io (Password123!)');
  console.log('👨‍💻 Creator: alex@forgeflow.dev (Password123!)');
  console.log('🛍️ Customer: jordan@buyer.com (Password123!)');
}

main()
  .catch((e) => {
    console.error('Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
