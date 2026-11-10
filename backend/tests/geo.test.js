// ==============================================================================
// CivicConnect Pan-India Geocoding & Geospatial Map Test Suite (geo.test.js)
// Validates Forward Search & Reverse Geocoding across all Indian Regions
// ==============================================================================

const request = require('supertest');
const app = require('../app');

describe('CivicConnect - Pan-India Geocoding & Location API Test Suite', () => {
  // ----------------------------------------------------------------------------
  // Forward Geocoding Search Tests
  // ----------------------------------------------------------------------------
  describe('GET /api/geo/search - Forward Geocoding', () => {
    it('1. should reject searches with less than 2 characters with 400 Bad Request', async () => {
      const res = await request(app).get('/api/geo/search?q=a');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/at least 2 characters/i);
    });

    it('2. should search for Hyderabad, Telangana and return accurate coordinates', async () => {
      const res = await request(app).get('/api/geo/search?q=Hyderabad');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const topResult = res.body.data[0];
      expect(topResult.latitude).toBeCloseTo(17.385, 1);
      expect(topResult.longitude).toBeCloseTo(78.486, 1);
      expect(topResult.address.country).toBe('India');
    });

    it('3. should search for Warangal, Telangana', async () => {
      const res = await request(app).get('/api/geo/search?q=Warangal');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      const match = res.body.data.find((d) => d.name.includes('Warangal') || d.displayName.includes('Warangal'));
      expect(match).toBeDefined();
    });

    it('4. should search for Karimnagar, Telangana', async () => {
      const res = await request(app).get('/api/geo/search?q=Karimnagar');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('5. should search for Vijayawada, Andhra Pradesh', async () => {
      const res = await request(app).get('/api/geo/search?q=Vijayawada');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      const match = res.body.data[0];
      expect(match.latitude).toBeCloseTo(16.5, 0);
      expect(match.longitude).toBeCloseTo(80.6, 0);
    });

    it('6. should search for Bengaluru, Karnataka', async () => {
      const res = await request(app).get('/api/geo/search?q=Bengaluru');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('7. should search for Chennai, Tamil Nadu', async () => {
      const res = await request(app).get('/api/geo/search?q=Chennai');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('8. should search for Mumbai, Maharashtra', async () => {
      const res = await request(app).get('/api/geo/search?q=Mumbai');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('9. should search for Kolkata, West Bengal', async () => {
      const res = await request(app).get('/api/geo/search?q=Kolkata');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('10. should search for Jaipur, Rajasthan', async () => {
      const res = await request(app).get('/api/geo/search?q=Jaipur');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('11. should search for Delhi (National Capital)', async () => {
      const res = await request(app).get('/api/geo/search?q=Delhi');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('12. should search for Srinagar, Jammu and Kashmir (Northern region)', async () => {
      const res = await request(app).get('/api/geo/search?q=Srinagar');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('13. should search for Port Blair, Andaman and Nicobar Islands (Island territory)', async () => {
      const res = await request(app).get('/api/geo/search?q=Port+Blair');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('14. should search by Indian 6-digit postal PIN code (e.g. 500001)', async () => {
      const res = await request(app).get('/api/geo/search?q=500001');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  // ----------------------------------------------------------------------------
  // Reverse Geocoding Tests
  // ----------------------------------------------------------------------------
  describe('GET /api/geo/reverse - Reverse Geocoding', () => {
    it('15. should reject requests with invalid latitude/longitude with 400', async () => {
      const res = await request(app).get('/api/geo/reverse?lat=invalid&lng=78.48');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('16. should reject out-of-range coordinates with 400', async () => {
      const res = await request(app).get('/api/geo/reverse?lat=195&lng=78.48');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('17. should reverse geocode Hyderabad coordinates to structured address', async () => {
      const res = await request(app).get('/api/geo/reverse?lat=17.385044&lng=78.486671');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.address.country).toBe('India');
      expect(res.body.data.address.state).toMatch(/Telangana/i);
    });

    it('18. should reverse geocode New Delhi coordinates to structured address', async () => {
      const res = await request(app).get('/api/geo/reverse?lat=28.613939&lng=77.209021');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.address.country).toBe('India');
      expect(res.body.data.address.state).toMatch(/Delhi/i);
    });

    it('19. should reverse geocode Mumbai coordinates to structured address', async () => {
      const res = await request(app).get('/api/geo/reverse?lat=19.075984&lng=72.877656');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.address.country).toBe('India');
      expect(res.body.data.address.state).toMatch(/Maharashtra/i);
    });
  });
});
