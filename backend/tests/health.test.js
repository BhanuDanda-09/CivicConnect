// ==============================================================================
// Health & Express Server Test Suite (health.test.js)
// ==============================================================================

const request = require('supertest');
const app = require('../app');

describe('CivicConnect Express Server & Health API Tests', () => {
  // Test 1: Express Application Initialization & Root Route
  it('should return 200 and application details on GET /', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.application).toBe('CivicConnect');
    expect(res.body.status).toBe('Operational');
  });

  // Test 2: Central API Index Route
  it('should return 200 and available endpoints on GET /api', async () => {
    const res = await request(app).get('/api');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.endpoints).toBeDefined();
    expect(res.body.endpoints.health).toBe('/api/health');
  });

  // Test 3: Health Check Endpoint Structure
  it('should return accurate structured health metrics on GET /api/health', async () => {
    const res = await request(app).get('/api/health');
    // Either 200 (if DB connected) or 503 (if DB offline in test environment)
    expect([200, 503]).toContain(res.statusCode);
    expect(res.body.application).toBe('CivicConnect');
    expect(res.body.server).toBe('healthy');
    expect(['connected', 'disconnected']).toContain(res.body.database);
    expect(res.body.timestamp).toBeDefined();
    expect(new Date(res.body.timestamp).getTime()).not.toBeNaN();
  });

  // Test 4: Unknown API Route Handler (404)
  it('should return 404 structured response for undefined API route', async () => {
    const res = await request(app).get('/api/v1/invalid-route-xyz');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Route not found');
  });

  // Test 5: Security Headers check (Helmet)
  it('should include Helmet security headers in responses', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-dns-prefetch-control']).toBe('off');
  });
});
