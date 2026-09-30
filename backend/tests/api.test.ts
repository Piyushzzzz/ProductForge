import { createApp } from '../src/app.js';
import http from 'http';

async function runTests() {
  console.log('🧪 Starting ProductForge Backend API Test Suite...');
  const app = createApp();
  const server = http.createServer(app);
  
  await new Promise<void>((resolve) => {
    server.listen(5099, () => resolve());
  });

  const baseUrl = 'http://localhost:5099/api';
  let passed = 0;
  let failed = 0;

  const test = async (name: string, fn: () => Promise<void>) => {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (e: any) {
      console.error(`  ❌ FAIL: ${name} ->`, e.message || e);
      failed++;
    }
  };

  try {
    // 1. Health check
    await test('Health Check Endpoint', async () => {
      const res = await fetch('http://localhost:5099/health');
      const data = await res.json() as any;
      if (data.status !== 'healthy') throw new Error('Health check failed');
    });

    // 2. Auth Login Test
    let customerToken = '';
    let creatorToken = '';

    await test('Module 1: User Login (Customer)', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'jordan@buyer.com',
          password: 'Password123!'
        })
      });
      const data = await res.json() as any;
      if (!data.success || !data.data.token) throw new Error('Login failed: ' + JSON.stringify(data));
      customerToken = data.data.token;
    });

    await test('Module 1: User Login (Creator)', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'alex@forgeflow.dev',
          password: 'Password123!'
        })
      });
      const data = await res.json() as any;
      if (!data.success || !data.data.token) throw new Error('Creator login failed');
      creatorToken = data.data.token;
    });

    // 3. Marketplace Browse
    await test('Module 3: Marketplace Browse Products', async () => {
      const res = await fetch(`${baseUrl}/marketplace/products`);
      const data = await res.json() as any;
      if (!data.success || !Array.isArray(data.data.products)) throw new Error('Marketplace query failed');
      if (data.data.products.length === 0) throw new Error('No products returned');
    });

    await test('Module 3: Marketplace Categories (/marketplace/categories)', async () => {
      const res = await fetch(`${baseUrl}/marketplace/categories`);
      const data = await res.json() as any;
      if (!data.success || data.data.length === 0) throw new Error('Categories query failed');
    });

    await test('Module 3: Product Categories Root (/categories)', async () => {
      const res = await fetch(`${baseUrl}/categories`);
      const data = await res.json() as any;
      if (!data.success || data.data.length === 0) throw new Error('/categories query failed');
    });

    let createdCategory: any = null;
    await test('Module 3: Create Category via POST /categories', async () => {
      const res = await fetch(`${baseUrl}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${creatorToken}`
        },
        body: JSON.stringify({
          name: `Automated Test Category ${Date.now()}`,
          description: 'Testing dynamic category generation',
          icon: 'Sparkles'
        })
      });
      const data = await res.json() as any;
      if (!data.success || !data.data?.id) throw new Error('Create category failed');
      createdCategory = data.data;
    });

    // 4. Product Details by Slug
    let sampleProduct: any = null;
    await test('Module 3: Get Product By Slug', async () => {
      const res = await fetch(`${baseUrl}/marketplace/products/invoicepro-cloud-billing`);
      const data = await res.json() as any;
      if (!data.success || !data.data.id) throw new Error('Product slug fetch failed');
      sampleProduct = data.data;
    });

    // 5. Entitlement Library
    await test('Module 7: Customer Entitlements Library', async () => {
      const res = await fetch(`${baseUrl}/entitlements/my-library`, {
        headers: { Authorization: `Bearer ${customerToken}` }
      });
      const data = await res.json() as any;
      if (!data.success || !Array.isArray(data.data)) throw new Error('Customer library fetch failed');
      if (data.data.length === 0) throw new Error('Customer entitlement missing in seeded data');
    });

    // 6. Creator Analytics Summary
    await test('Module 9: Creator Analytics Summary', async () => {
      const res = await fetch(`${baseUrl}/analytics/creator/summary`, {
        headers: { Authorization: `Bearer ${creatorToken}` }
      });
      const data = await res.json() as any;
      if (!data.success || typeof data.data.totalRevenue !== 'number') throw new Error('Analytics summary failed');
    });

    // 7. Sandbox Order Checkout Flow
    await test('Module 6 & 7: Sandbox Checkout & Instant Entitlement', async () => {
      const res = await fetch(`${baseUrl}/orders/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`
        },
        body: JSON.stringify({
          productId: sampleProduct.id,
          pricingPlanId: sampleProduct.pricingPlans[0].id
        })
      });
      const data = await res.json() as any;
      if (!data.success || !data.data.entitlement.licenseKey) throw new Error('Checkout entitlement failed');
    });

    // 8. Notifications list
    await test('Module 10: Notification Feed', async () => {
      const res = await fetch(`${baseUrl}/notifications`, {
        headers: { Authorization: `Bearer ${customerToken}` }
      });
      const data = await res.json() as any;
      if (!data.success || !Array.isArray(data.data)) throw new Error('Notification feed failed');
    });

    // 9. Module 4: Version Comparison & Diffing
    await test('Module 4: Version Comparison & Diffing Engine', async () => {
      const res = await fetch(`${baseUrl}/releases/products/${sampleProduct.id}/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newVersionNumber: 'v2.0.0',
          newReleaseTitle: 'Version 2.0 Architectural Overhaul',
          newReleaseNotes: 'Refactored APIs\nAdded WebSocket streaming'
        })
      });
      const data = await res.json() as any;
      if (!data.success || !data.data.semverDiff) throw new Error('Version compare failed');
      if (data.data.semverDiff.bumpType !== 'MAJOR') throw new Error('SemVer bump detection failed');
    });

    // 10. Module 4: Version Rollback Engine
    await test('Module 4: Version Rollback Capability', async () => {
      // 1. Create a new release v1.9.9
      const createRes = await fetch(`${baseUrl}/releases/products/${sampleProduct.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${creatorToken}`
        },
        body: JSON.stringify({
          versionNumber: 'v1.9.9',
          releaseTitle: 'Experimental Release',
          releaseNotes: 'Testing rollback capability'
        })
      });
      const createData = await createRes.json() as any;
      if (!createData.success) throw new Error('Failed to create test version: ' + JSON.stringify(createData));

      // 2. Fetch releases to get previous stable version
      const listRes = await fetch(`${baseUrl}/releases/products/${sampleProduct.id}`);
      const listData = await listRes.json() as any;
      const releases = listData.data || [];
      const previousVersion = releases.find((r: any) => r.id !== createData.data.id);
      if (!previousVersion) throw new Error('No previous version found to roll back to');

      // 3. Execute Rollback to previous version
      const rollbackRes = await fetch(`${baseUrl}/releases/products/${sampleProduct.id}/rollback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${creatorToken}`
        },
        body: JSON.stringify({
          targetVersionId: previousVersion.id,
          reason: 'Severe regression detected in testing.'
        })
      });
      const rollbackData = await rollbackRes.json() as any;
      if (!rollbackData.success) throw new Error('Rollback failed: ' + JSON.stringify(rollbackData));
      if (!rollbackData.data.restoredVersion.isCurrent) throw new Error('Restored version is not marked isCurrent');
    });

    console.log(`\n🏁 Test Results: ${passed} passed, ${failed} failed.`);
  } finally {
    server.close();
  }

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
