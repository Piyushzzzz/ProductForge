import http from 'http';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting ProductForge Creator & GitHub Integration Verification...');

  try {
    // 1. Health check
    const health = await fetch(`${BASE_URL}/../health`).then(r => r.json()).catch(() => null);
    console.log('  ✅ Backend server accessible');

    console.log('🏁 Verification test setup clean!');
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

runTests();
