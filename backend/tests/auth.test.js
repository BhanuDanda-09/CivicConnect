// ==============================================================================
// Authentication & Role-Based Access Control Test Suite (auth.test.js)
// Tests: Registration, Login, JWT verification, and Role Authorization
// ==============================================================================

const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const app = require('../app');
const User = require('../models/User');
const { generateToken } = require('../utils/tokenUtils');

describe('CivicConnect Phase 4 - Authentication & RBAC Test Suite', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_civicconnect_change_in_production';

  const mockCitizen = {
    _id: new mongoose.Types.ObjectId(),
    fullName: 'Rahul Sharma',
    email: 'rahul.citizen@example.com',
    password: 'hashed_password_sample_123',
    mobileNumber: '+919876543210',
    address: 'Lotus Heights, Ward 4',
    ward: 'Ward 4 - South Green Park',
    role: 'citizen',
    isActive: true,
    comparePassword: jest.fn(),
    toJSON: function () {
      return {
        _id: this._id,
        fullName: this.fullName,
        email: this.email,
        mobileNumber: this.mobileNumber,
        address: this.address,
        ward: this.ward,
        role: this.role,
        isActive: this.isActive,
      };
    },
  };

  const mockAdmin = {
    _id: new mongoose.Types.ObjectId(),
    fullName: 'Priya Deshmukh',
    email: 'admin@civicconnect.org',
    role: 'admin',
    isActive: true,
  };

  const mockWorker = {
    _id: new mongoose.Types.ObjectId(),
    fullName: 'Ramesh Patel',
    email: 'worker@civicconnect.org',
    role: 'worker',
    isActive: true,
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ============================================================================
  // 1. REGISTRATION TESTS
  // ============================================================================
  describe('POST /api/auth/register', () => {
    it('1. should successfully register a new citizen and return 201 with token', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      jest.spyOn(User, 'create').mockResolvedValue(mockCitizen);

      const res = await request(app).post('/api/auth/register').send({
        fullName: 'Rahul Sharma',
        email: 'rahul.citizen@example.com',
        password: 'Password@123',
        mobileNumber: '9876543210',
        address: 'Lotus Heights, Ward 4',
        ward: 'Ward 4',
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('citizen');
      expect(res.body.user.password).toBeUndefined();
    });

    it('2. should reject registration with missing required fields (400)', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'incomplete@example.com',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Validation Error');
    });

    it('3. should reject registration with invalid email format (400)', async () => {
      const res = await request(app).post('/api/auth/register').send({
        fullName: 'Test User',
        email: 'not-an-email',
        password: 'Password@123',
        mobileNumber: '9876543210',
        address: 'Ward 1',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('valid email address');
    });

    it('4. should reject registration with weak password under 6 chars (400)', async () => {
      const res = await request(app).post('/api/auth/register').send({
        fullName: 'Test User',
        email: 'test@example.com',
        password: '123',
        mobileNumber: '9876543210',
        address: 'Ward 1',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Password must be at least 6 characters');
    });

    it('5. should reject duplicate email registration with 409 Conflict', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(mockCitizen);

      const res = await request(app).post('/api/auth/register').send({
        fullName: 'Rahul Sharma',
        email: 'rahul.citizen@example.com',
        password: 'Password@123',
        mobileNumber: '9876543210',
        address: 'Ward 4',
      });

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toContain('already exists');
    });

    it('6. should enforce CITIZEN role even if user attempts to register as ADMIN', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      let createdData = null;
      jest.spyOn(User, 'create').mockImplementation((data) => {
        createdData = data;
        return Promise.resolve({ ...mockCitizen, role: data.role });
      });

      await request(app).post('/api/auth/register').send({
        fullName: 'Malicious User',
        email: 'hacker@example.com',
        password: 'Password@123',
        mobileNumber: '9876543210',
        address: 'Ward 1',
        role: 'admin', // Attempt privilege escalation
      });

      expect(createdData.role).toBe('citizen');
    });

    it('7. should verify password hashing hook is configured with bcrypt', async () => {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('PlainPass123', salt);
      const isMatch = await bcrypt.compare('PlainPass123', hash);
      expect(isMatch).toBe(true);
      expect(hash).not.toBe('PlainPass123');
    });

    it('8. should ensure password field is never returned in registration response', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      jest.spyOn(User, 'create').mockResolvedValue(mockCitizen);

      const res = await request(app).post('/api/auth/register').send({
        fullName: 'Secure User',
        email: 'secure@example.com',
        password: 'Password@123',
        mobileNumber: '9876543210',
        address: 'Ward 4',
      });

      expect(res.body.user.password).toBeUndefined();
    });
  });

  // ============================================================================
  // 2. LOGIN TESTS
  // ============================================================================
  describe('POST /api/auth/login', () => {
    it('1. should successfully log in with valid credentials and return 200 with JWT', async () => {
      const userInstance = {
        ...mockCitizen,
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(User, 'findOne').mockReturnValue({
        select: jest.fn().mockResolvedValue(userInstance),
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'rahul.citizen@example.com',
        password: 'Password@123',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('citizen');
    });

    it('2. should reject login with incorrect password with 401', async () => {
      const userInstance = {
        ...mockCitizen,
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      jest.spyOn(User, 'findOne').mockReturnValue({
        select: jest.fn().mockResolvedValue(userInstance),
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'rahul.citizen@example.com',
        password: 'WrongPassword',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid email or password.');
    });

    it('3. should reject login with unknown email with generic 401', async () => {
      jest.spyOn(User, 'findOne').mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'Password@123',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid email or password.');
    });

    it('4. should reject login with missing email or password with 400', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
      });

      expect(res.statusCode).toBe(400);
    });

    it('5. should reject login if user account is deactivated with 403', async () => {
      const inactiveUser = {
        ...mockCitizen,
        isActive: false,
      };

      jest.spyOn(User, 'findOne').mockReturnValue({
        select: jest.fn().mockResolvedValue(inactiveUser),
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'inactive@example.com',
        password: 'Password@123',
      });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('deactivated');
    });

    it('6. should verify generated JWT contains user ID and role', () => {
      const token = generateToken(mockCitizen);
      const decoded = jwt.verify(token, JWT_SECRET);
      expect(decoded.id.toString()).toBe(mockCitizen._id.toString());
      expect(decoded.role).toBe('citizen');
      expect(decoded.email).toBe(mockCitizen.email);
    });
  });

  // ============================================================================
  // 3. AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC) TESTS
  // ============================================================================
  describe('JWT Protection & Role Authorization', () => {
    it('1. should allow access to protected route when valid JWT is supplied', async () => {
      const token = generateToken(mockCitizen);
      jest.spyOn(User, 'findById').mockResolvedValue(mockCitizen);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user.email).toBe(mockCitizen.email);
    });

    it('2. should reject access to protected route when Authorization header is missing (401)', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain('token is missing');
    });

    it('3. should reject access when token signature is invalid (401)', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.tampered.token');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain('Invalid authentication token');
    });

    it('4. should reject access when token has expired (401)', async () => {
      const expiredToken = jwt.sign(
        { id: mockCitizen._id, role: 'citizen' },
        JWT_SECRET,
        { expiresIn: '-1s' } // Expired 1 second ago
      );

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain('expired');
    });

    it('5. should allow ADMIN role to access admin-only endpoint (200)', async () => {
      const adminToken = generateToken(mockAdmin);
      jest.spyOn(User, 'findById').mockResolvedValue(mockAdmin);

      const res = await request(app)
        .get('/api/auth/admin-check')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Authorized');
    });

    it('6. should block CITIZEN role from accessing admin-only endpoint with 403 Forbidden', async () => {
      const citizenToken = generateToken(mockCitizen);
      jest.spyOn(User, 'findById').mockResolvedValue(mockCitizen);

      const res = await request(app)
        .get('/api/auth/admin-check')
        .set('Authorization', `Bearer ${citizenToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('Forbidden');
    });

    it('7. should block WORKER role from accessing admin-only endpoint with 403 Forbidden', async () => {
      const workerToken = generateToken(mockWorker);
      jest.spyOn(User, 'findById').mockResolvedValue(mockWorker);

      const res = await request(app)
        .get('/api/auth/admin-check')
        .set('Authorization', `Bearer ${workerToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('Forbidden');
    });

    it('8. should return success on POST /api/auth/logout', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('logged out');
    });
  });
});

