// ==============================================================================
// Admin Analytics & Management Test Suite (adminAnalytics.test.js)
// Phase 6 Municipal Admin Overview, Workers, Wards, Locations & User Mgmt
// ==============================================================================

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const { generateToken } = require('../utils/tokenUtils');

describe('CivicConnect Phase 6 - Municipal Admin Analytics & Operations Test Suite', () => {
  const adminId = new mongoose.Types.ObjectId();
  const citizenId = new mongoose.Types.ObjectId();
  const workerId = new mongoose.Types.ObjectId();

  const mockAdmin = {
    _id: adminId,
    fullName: 'Priya Deshmukh',
    email: 'admin@civicconnect.org',
    role: 'admin',
    isActive: true,
  };

  const mockCitizen = {
    _id: citizenId,
    fullName: 'Rahul Sharma',
    email: 'rahul@example.com',
    role: 'citizen',
    isActive: true,
  };

  const mockWorker = {
    _id: workerId,
    fullName: 'Ramesh Patel',
    email: 'ramesh.worker@civicconnect.org',
    role: 'worker',
    trade: 'Roads & Public Infrastructure',
    ward: 'Ward 1 - Central Market & Bus Terminal',
    mobileNumber: '+91 98000 11111',
    isActive: true,
    toJSON: () => ({
      _id: workerId,
      fullName: 'Ramesh Patel',
      email: 'ramesh.worker@civicconnect.org',
      role: 'worker',
      trade: 'Roads & Public Infrastructure',
      ward: 'Ward 1 - Central Market & Bus Terminal',
      mobileNumber: '+91 98000 11111',
      isActive: true,
    }),
  };

  const adminToken = generateToken(mockAdmin);
  const citizenToken = generateToken(mockCitizen);

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // 1. Admin overview metrics
  it('1. should return municipal summary metrics and breakdown datasets for admin', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockAdmin);

    // Mock countDocuments for different statuses
    jest.spyOn(Complaint, 'countDocuments').mockImplementation((filter) => {
      if (!filter || !filter.status) return Promise.resolve(25);
      if (filter.status === 'SUBMITTED') return Promise.resolve(5);
      if (filter.status === 'UNDER_VERIFICATION') return Promise.resolve(3);
      if (filter.status === 'VERIFIED') return Promise.resolve(2);
      if (filter.status === 'ASSIGNED') return Promise.resolve(4);
      if (filter.status === 'IN_PROGRESS') return Promise.resolve(3);
      if (filter.status === 'RESOLVED') return Promise.resolve(7);
      if (filter.status === 'CITIZEN_FEEDBACK') return Promise.resolve(1);
      if (filter.status === 'REJECTED') return Promise.resolve(0);
      return Promise.resolve(25);
    });

    // Mock aggregate for status, category, priority, monthly trends
    jest.spyOn(Complaint, 'aggregate').mockImplementation((pipeline) => {
      const groupStage = pipeline.find((p) => p.$group);
      if (groupStage) {
        if (groupStage.$group._id === '$status') {
          return Promise.resolve([
            { _id: 'SUBMITTED', count: 5 },
            { _id: 'IN_PROGRESS', count: 3 },
            { _id: 'RESOLVED', count: 8 },
          ]);
        }
        if (groupStage.$group._id === '$category') {
          return Promise.resolve([
            { _id: 'pothole', count: 12 },
            { _id: 'garbage', count: 8 },
          ]);
        }
        if (groupStage.$group._id === '$priority') {
          return Promise.resolve([
            { _id: 'MEDIUM', count: 15 },
            { _id: 'HIGH', count: 10 },
          ]);
        }
        return Promise.resolve([
          { _id: '2026-10', submitted: 15, resolved: 12 },
          { _id: '2026-11', submitted: 25, resolved: 8 },
        ]);
      }
      return Promise.resolve([]);
    });

    const mockSort = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockReturnThis();
    const mockPopulate1 = jest.fn().mockReturnThis();
    const mockPopulate2 = jest.fn().mockResolvedValue([]);

    jest.spyOn(Complaint, 'find').mockReturnValue({
      sort: mockSort,
      limit: mockLimit,
      populate: mockPopulate1.mockReturnValue({ populate: mockPopulate2 }),
    });

    const res = await request(app)
      .get('/api/admin/analytics/overview?period=30days')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.summary).toBeDefined();
    expect(res.body.data.summary.total).toBe(25);
    expect(res.body.data.statusBreakdown).toBeInstanceOf(Array);
    expect(res.body.data.categoryBreakdown).toBeInstanceOf(Array);
    expect(res.body.data.monthlyTrends).toBeInstanceOf(Array);
  });

  // 2. Admin worker performance
  it('2. should return worker performance workload metrics', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockAdmin);
    jest.spyOn(User, 'find').mockReturnValue({
      sort: jest.fn().mockResolvedValue([mockWorker]),
    });

    jest.spyOn(Complaint, 'countDocuments').mockImplementation((filter) => {
      if (filter.status === 'ASSIGNED') return Promise.resolve(2);
      if (filter.status === 'IN_PROGRESS') return Promise.resolve(1);
      return Promise.resolve(5); // resolved
    });

    const res = await request(app)
      .get('/api/admin/analytics/workers')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].name).toBe('Ramesh Patel');
    expect(res.body.data[0].assignedTasks).toBe(2);
    expect(res.body.data[0].completedTasks).toBe(5);
  });

  // 3. Admin ward analytics
  it('3. should return aggregated ward-level statistics', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockAdmin);
    jest.spyOn(Complaint, 'aggregate').mockResolvedValue([
      {
        _id: 'Ward 1 - Central Market & Bus Terminal',
        total: 12,
        pending: 3,
        inProgress: 4,
        resolved: 5,
        rejected: 0,
      },
    ]);

    const res = await request(app)
      .get('/api/admin/analytics/wards')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].ward).toContain('Ward 1');
    expect(res.body.data[0].total).toBe(12);
    expect(res.body.data[0].resolutionRate).toBe(42);
  });

  // 4. Admin complaint locations for Leaflet
  it('4. should return sanitized geographic coordinates for OpenStreetMap', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockAdmin);

    const mockGeoComplaints = [
      {
        _id: new mongoose.Types.ObjectId(),
        complaintId: 'CC-2026-0045',
        title: 'Burst water main',
        category: 'water_leakage',
        priority: 'EMERGENCY',
        status: 'IN_PROGRESS',
        ward: 'Ward 3',
        location: 'Main Road',
        latitude: 18.5204,
        longitude: 73.8567,
        createdAt: new Date(),
        citizen: { fullName: 'Sanjay Gupta' },
        assignedWorker: { fullName: 'Ramesh Patel' },
      },
    ];

    const selectMock = jest.fn().mockReturnThis();
    const pop1Mock = jest.fn().mockReturnThis();
    const pop2Mock = jest.fn().mockReturnThis();
    const sortMock = jest.fn().mockReturnThis();
    const limitMock = jest.fn().mockResolvedValue(mockGeoComplaints);

    jest.spyOn(Complaint, 'find').mockReturnValue({
      select: selectMock,
      populate: pop1Mock.mockReturnValue({
        populate: pop2Mock.mockReturnValue({
          sort: sortMock.mockReturnValue({
            limit: limitMock,
          }),
        }),
      }),
    });

    const res = await request(app)
      .get('/api/admin/analytics/complaint-locations')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].complaintId).toBe('CC-2026-0045');
    expect(res.body.data[0].coordinates).toEqual([18.5204, 73.8567]);
  });

  // 5. Admin workers registry - list & create
  it('5. should list and register municipal field workers', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockAdmin);
    jest.spyOn(User, 'find').mockReturnValue({
      sort: jest.fn().mockResolvedValue([mockWorker]),
    });
    jest.spyOn(Complaint, 'countDocuments').mockResolvedValue(2);

    const listRes = await request(app)
      .get('/api/admin/workers')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.count).toBe(1);

    // Create worker
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    jest.spyOn(User.prototype, 'save').mockResolvedValue(true);

    const createRes = await request(app)
      .post('/api/admin/workers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fullName: 'Vikram Joshi',
        email: 'vikram.joshi@civicconnect.org',
        mobileNumber: '+91 98222 33445',
        trade: 'Electrical & Street Lighting',
        ward: 'Ward 2 - Railway Colony',
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data.name).toBe('Vikram Joshi');
  });

  // 6. Admin user directory - list & toggle status
  it('6. should list users and toggle activation status', async () => {
    jest.spyOn(User, 'findById').mockImplementation((id) => {
      if (id.toString() === adminId.toString()) return Promise.resolve(mockAdmin);
      return Promise.resolve({
        _id: citizenId,
        fullName: 'Rahul Sharma',
        email: 'rahul@example.com',
        role: 'citizen',
        isActive: true,
        save: jest.fn().mockResolvedValue(true),
      });
    });

    const sortMock = jest.fn().mockReturnThis();
    const skipMock = jest.fn().mockReturnThis();
    const limitMock = jest.fn().mockResolvedValue([mockCitizen]);

    jest.spyOn(User, 'find').mockReturnValue({
      sort: sortMock,
      skip: skipMock,
      limit: limitMock,
    });
    jest.spyOn(User, 'countDocuments').mockResolvedValue(1);
    jest.spyOn(Complaint, 'countDocuments').mockResolvedValue(3);

    const listRes = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data[0].name).toBe('Rahul Sharma');

    // Toggle status
    const toggleRes = await request(app)
      .patch(`/api/admin/users/${citizenId}/toggle-status`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(toggleRes.status).toBe(200);
    expect(toggleRes.body.success).toBe(true);
    expect(toggleRes.body.data.isActive).toBe(false);
  });

  // 7. Prevent admin self-deactivation guard
  it('7. should reject attempts by admin to deactivate their own account', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue({
      _id: adminId,
      fullName: 'Priya Deshmukh',
      role: 'admin',
      isActive: true,
    });

    const res = await request(app)
      .patch(`/api/admin/users/${adminId}/toggle-status`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('cannot deactivate their own');
  });

  // 8. Security guard: Citizen cannot access admin analytics
  it('8. should return 403 Forbidden when a citizen attempts to access admin analytics', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockCitizen);

    const res = await request(app)
      .get('/api/admin/analytics/overview')
      .set('Authorization', `Bearer ${citizenToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
