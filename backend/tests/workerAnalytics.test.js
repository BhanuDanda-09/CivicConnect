// ==============================================================================
// Worker Analytics Test Suite (workerAnalytics.test.js)
// Phase 6 Field Worker Personal Performance, Task Workload & Map Coordinates
// ==============================================================================

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const { generateToken } = require('../utils/tokenUtils');

describe('CivicConnect Phase 6 - Field Worker Analytics Test Suite', () => {
  const workerId = new mongoose.Types.ObjectId();
  const citizenId = new mongoose.Types.ObjectId();

  const mockWorker = {
    _id: workerId,
    fullName: 'Ramesh Patel',
    email: 'ramesh.worker@civicconnect.org',
    role: 'worker',
    trade: 'Roads & Public Infrastructure',
    ward: 'Ward 1 - Central Market & Bus Terminal',
    mobileNumber: '+91 98000 11111',
    isActive: true,
  };

  const mockCitizen = {
    _id: citizenId,
    fullName: 'Rahul Sharma',
    email: 'rahul@example.com',
    role: 'citizen',
    isActive: true,
  };

  const workerToken = generateToken(mockWorker);
  const citizenToken = generateToken(mockCitizen);

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // 1. Worker personal overview metrics
  it('1. should return personal workload statistics and recent tasks for authenticated worker', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockWorker);

    jest.spyOn(Complaint, 'countDocuments').mockImplementation((filter) => {
      if (filter.status === 'ASSIGNED') return Promise.resolve(3);
      if (filter.status === 'IN_PROGRESS') return Promise.resolve(2);
      if (filter.status && filter.status.$in) return Promise.resolve(8);
      if (filter.priority === 'EMERGENCY') return Promise.resolve(1);
      if (filter.priority === 'HIGH') return Promise.resolve(2);
      return Promise.resolve(13); // total assigned
    });

    const mockRecent = [
      {
        _id: new mongoose.Types.ObjectId(),
        complaintId: 'CC-2026-0089',
        title: 'Deep road crater',
        category: 'pothole',
        priority: 'EMERGENCY',
        status: 'IN_PROGRESS',
        ward: 'Ward 1',
        location: 'MG Road',
        createdAt: new Date(),
        updatedAt: new Date(),
        citizen: { fullName: 'Sunita Rao', mobileNumber: '+91 98765 43210' },
      },
    ];

    const sortMock = jest.fn().mockReturnThis();
    const limitMock = jest.fn().mockReturnThis();
    const popMock = jest.fn().mockResolvedValue(mockRecent);

    jest.spyOn(Complaint, 'find').mockReturnValue({
      sort: sortMock,
      limit: limitMock,
      populate: popMock,
    });

    const res = await request(app)
      .get('/api/workers/analytics/overview')
      .set('Authorization', `Bearer ${workerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.worker.name).toBe('Ramesh Patel');
    expect(res.body.data.summary.totalAssigned).toBe(13);
    expect(res.body.data.summary.inProgress).toBe(2);
    expect(res.body.data.summary.urgent).toBe(1);
    expect(res.body.data.summary.completionRate).toBe(62);
    expect(res.body.data.recentTasks[0].complaintId).toBe('CC-2026-0089');
  });

  // 2. Worker task location coordinates
  it('2. should return geographic task coordinates assigned strictly to this worker', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockWorker);

    const mockLocations = [
      {
        _id: new mongoose.Types.ObjectId(),
        complaintId: 'CC-2026-0089',
        title: 'Deep road crater',
        category: 'pothole',
        priority: 'EMERGENCY',
        status: 'IN_PROGRESS',
        ward: 'Ward 1',
        location: 'MG Road',
        latitude: 18.5204,
        longitude: 73.8567,
        createdAt: new Date(),
        citizen: { fullName: 'Sunita Rao', mobileNumber: '+91 98765 43210' },
      },
    ];

    const selectMock = jest.fn().mockReturnThis();
    const popMock = jest.fn().mockReturnThis();
    const sortMock = jest.fn().mockResolvedValue(mockLocations);

    jest.spyOn(Complaint, 'find').mockReturnValue({
      select: selectMock,
      populate: popMock.mockReturnValue({
        sort: sortMock,
      }),
    });

    const res = await request(app)
      .get('/api/workers/analytics/task-locations')
      .set('Authorization', `Bearer ${workerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].coordinates).toEqual([18.5204, 73.8567]);
  });

  // 3. Security: Citizen cannot access worker analytics
  it('3. should return 403 Forbidden when a citizen attempts to access worker analytics', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockCitizen);

    const res = await request(app)
      .get('/api/workers/analytics/overview')
      .set('Authorization', `Bearer ${citizenToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // 4. Security: Unauthorized request without token
  it('4. should return 401 Unauthorized when request lacks Bearer token', async () => {
    const res = await request(app).get('/api/workers/analytics/overview');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
