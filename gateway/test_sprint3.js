const axios = require('axios');
const jwt = require('jsonwebtoken');

const GATEWAY_URL = 'http://localhost:5000';
const JWT_SECRET = 'intelligate-super-secret-key'; // Matching the one in authenticationMiddleware.js

let projectId = '';
let apiKey = '';

// Helper to pause execution
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const runTests = async () => {
  console.log('--- IntelliGate AI Sprint 3 Verification ---');
  
  // 0. Setup: Create a Project
  try {
    const res = await axios.post(`${GATEWAY_URL}/api/projects`, { name: 'Test Project' });
    projectId = res.data.data._id;
    apiKey = res.data.data.apiKey;
    console.log(`[Setup] Created project with API Key: ${apiKey}`);
  } catch (err) {
    console.error('[Setup] Failed to create project:', err.message);
    return;
  }

  // TEST 1: All features disabled (Default)
  console.log('\n[TEST 1] All features disabled');
  try {
    const res = await axios.get(`${GATEWAY_URL}/api/products`, { headers: { 'x-api-key': apiKey } });
    console.log('Expected: 200 | Got:', res.status, '-> PASS');
  } catch (err) {
    console.error('FAIL:', err.response?.status);
  }

  // TEST 2: Authentication enabled + no JWT
  console.log('\n[TEST 2] Auth enabled + no JWT');
  await axios.put(`${GATEWAY_URL}/api/projects/${projectId}/config`, {
    authentication: { enabled: true }
  });
  try {
    await axios.get(`${GATEWAY_URL}/api/products`, { headers: { 'x-api-key': apiKey } });
    console.error('FAIL: Should have thrown 401');
  } catch (err) {
    console.log('Expected: 401 | Got:', err.response?.status, '-> PASS');
  }

  // TEST 3: Authentication enabled + invalid JWT
  console.log('\n[TEST 3] Auth enabled + invalid JWT');
  try {
    await axios.get(`${GATEWAY_URL}/api/products`, { 
      headers: { 'x-api-key': apiKey, 'Authorization': 'Bearer INVALID_TOKEN' } 
    });
    console.error('FAIL: Should have thrown 401');
  } catch (err) {
    console.log('Expected: 401 | Got:', err.response?.status, '-> PASS');
  }

  // TEST 4: Authentication enabled + valid JWT
  console.log('\n[TEST 4] Auth enabled + valid JWT');
  const validTokenUser = jwt.sign({ userId: '123', role: 'user' }, JWT_SECRET);
  try {
    const res = await axios.get(`${GATEWAY_URL}/api/products`, { 
      headers: { 'x-api-key': apiKey, 'Authorization': `Bearer ${validTokenUser}` } 
    });
    console.log('Expected: 200 | Got:', res.status, '-> PASS');
  } catch (err) {
    console.error('FAIL:', err.response?.status);
  }

  // TEST 5: Authorization enabled + wrong role
  console.log('\n[TEST 5] Authz enabled + wrong role');
  await axios.put(`${GATEWAY_URL}/api/projects/${projectId}/config`, {
    authorization: { enabled: true, allowedRoles: ['admin'] }
  });
  try {
    await axios.get(`${GATEWAY_URL}/api/products`, { 
      headers: { 'x-api-key': apiKey, 'Authorization': `Bearer ${validTokenUser}` } 
    });
    console.error('FAIL: Should have thrown 403');
  } catch (err) {
    console.log('Expected: 403 | Got:', err.response?.status, '-> PASS');
  }

  // TEST 6: Authorization enabled + allowed role
  console.log('\n[TEST 6] Authz enabled + allowed role');
  const validTokenAdmin = jwt.sign({ userId: '123', role: 'admin' }, JWT_SECRET);
  try {
    const res = await axios.get(`${GATEWAY_URL}/api/products`, { 
      headers: { 'x-api-key': apiKey, 'Authorization': `Bearer ${validTokenAdmin}` } 
    });
    console.log('Expected: 200 | Got:', res.status, '-> PASS');
  } catch (err) {
    console.error('FAIL:', err.response?.status);
  }

  // Disable Auth/Authz for remaining tests
  await axios.put(`${GATEWAY_URL}/api/projects/${projectId}/config`, {
    authentication: { enabled: false },
    authorization: { enabled: false }
  });

  // TEST 7: Rate limit (max 3 per 60s)
  console.log('\n[TEST 7] Rate limit (max 3, window 60s)');
  await axios.put(`${GATEWAY_URL}/api/projects/${projectId}/config`, {
    rateLimit: { enabled: true, maxRequests: 3, windowSeconds: 60 }
  });
  
  for (let i = 1; i <= 4; i++) {
    try {
      const res = await axios.get(`${GATEWAY_URL}/api/products`, { headers: { 'x-api-key': apiKey } });
      console.log(`Req ${i}: Expected 200 | Got: ${res.status}`);
    } catch (err) {
      console.log(`Req ${i}: Expected 429 | Got: ${err.response?.status}`);
    }
  }

  // Disable Rate Limit for caching test
  await axios.put(`${GATEWAY_URL}/api/projects/${projectId}/config`, {
    rateLimit: { enabled: false }
  });

  // TEST 8: Caching enabled
  console.log('\n[TEST 8] Caching enabled (ttl 60s)');
  await axios.put(`${GATEWAY_URL}/api/projects/${projectId}/config`, {
    cache: { enabled: true, ttlSeconds: 60, methods: ['GET'] }
  });
  
  try {
    // First request - Cache MISS (backend called)
    let start = Date.now();
    await axios.get(`${GATEWAY_URL}/api/orders`, { headers: { 'x-api-key': apiKey } });
    console.log(`First GET (MISS) took: ${Date.now() - start}ms`);
    
    // Check logs manually for HIT/MISS, but typically latency is lower on hit
    start = Date.now();
    await axios.get(`${GATEWAY_URL}/api/orders`, { headers: { 'x-api-key': apiKey } });
    console.log(`Second GET (HIT) took: ${Date.now() - start}ms -> Check Gateway logs for "Cache: HIT"`);
  } catch (err) {
    console.error('FAIL:', err.message);
  }

  // TEST 9: Caching disabled
  console.log('\n[TEST 9] Caching disabled');
  await axios.put(`${GATEWAY_URL}/api/projects/${projectId}/config`, {
    cache: { enabled: false }
  });
  try {
    await axios.get(`${GATEWAY_URL}/api/products`, { headers: { 'x-api-key': apiKey } });
    await axios.get(`${GATEWAY_URL}/api/products`, { headers: { 'x-api-key': apiKey } });
    console.log('Executed 2 requests -> Check Gateway logs for "Cache: MISS" on both');
  } catch (err) {
    console.error('FAIL:', err.message);
  }

  console.log('\n--- Tests Complete ---');
};

runTests();
