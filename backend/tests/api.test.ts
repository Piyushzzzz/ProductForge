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

    await test('Module 3: Marketplace Categories', async () => {
      const res = await fetch(`${baseUrl}/marketplace/categories`);
      const data = await res.json() as any;
      if (!data.success || data.data.length === 0) throw new Error('Categories query failed');
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

    console.log(`\n🏁 Test Results: ${passed} passed, ${failed} failed.`);
  } finally {
    server.close();
  }

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
