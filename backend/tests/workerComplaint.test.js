// ==============================================================================
// Field Worker Complaint Test Suite (workerComplaint.test.js)
// ==============================================================================

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const ComplaintHistory = require('../models/ComplaintHistory');
const { generateToken } = require('../utils/tokenUtils');

describe('CivicConnect Phase 5 - Field Worker Complaint Test Suite', () => {
  const workerId1 = new mongoose.Types.ObjectId();
  const workerId2 = new mongoose.Types.ObjectId();
  const citizenId = new mongoose.Types.ObjectId();

  const mockWorker1 = {
    _id: workerId1,
    fullName: 'Ramesh Patel',
    email: 'worker1@civicconnect.org',
    role: 'worker',
    isActive: true,
  };

  const mockWorker2 = {
    _id: workerId2,
    fullName: 'Alex Dsouza',
    email: 'worker2@civicconnect.org',
    role: 'worker',
    isActive: true,
  };

  const mockCitizen = {
    _id: citizenId,
    fullName: 'Rahul Sharma',
    email: 'citizen@example.com',
    role: 'citizen',
    isActive: true,
  };

  const workerToken1 = generateToken(mockWorker1);
  const citizenToken = generateToken(mockCitizen);

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // 1. Worker views assigned complaints
  it('1. should allow worker to view complaints assigned to them', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockWorker1);

    const mockTasks = [
      {
        _id: new mongoose.Types.ObjectId(),
        complaintId: 'CC-2026-0001',
        title: 'Road repair on 4th cross',
        status: 'ASSIGNED',
        assignedWorker: workerId1,
      },
    ];

    const sortMock = jest.fn().mockReturnThis();
    const populateMock = jest.fn().mockResolvedValue(mockTasks);

    jest.spyOn(Complaint, 'find').mockReturnValue({
      sort: sortMock,
      populate: populateMock,
    });

    const res = await request(app)
      .get('/api/workers/complaints')
      .set('Authorization', `Bearer ${workerToken1}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].assignedWorker.toString()).toBe(workerId1.toString());
  });

  // 2. Worker cannot view another worker's task details
  it('2. should forbid worker from viewing tasks assigned to another worker (403)', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockWorker1);

    const taskDoc = {
      _id: new mongoose.Types.ObjectId(),
      complaintId: 'CC-2026-0099',
      assignedWorker: workerId2, // Assigned to worker 2 (Alex)
      status: 'ASSIGNED',
      citizen: citizenId,
    };

    jest.spyOn(Complaint, 'findById').mockResolvedValue(taskDoc);

    const res = await request(app)
      .get(`/api/workers/complaints/${taskDoc._id}`)
      .set('Authorization', `Bearer ${workerToken1}`); // Worker 1 requests Worker 2's task

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // 3. Worker starts work on assigned task
  it('3. should allow worker to transition status from ASSIGNED to IN_PROGRESS', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockWorker1);

    const taskDoc = {
      _id: new mongoose.Types.ObjectId(),
      complaintId: 'CC-2026-0002',
      status: 'ASSIGNED',
      assignedWorker: workerId1,
      save: jest.fn().mockResolvedValue(true),
    };

    jest.spyOn(Complaint, 'findById').mockResolvedValue(taskDoc);
    jest.spyOn(ComplaintHistory, 'create').mockResolvedValue(true);

    const res = await request(app)
      .patch(`/api/workers/complaints/${taskDoc._id}/start`)
      .set('Authorization', `Bearer ${workerToken1}`)
      .send({ remarks: 'Field crew arrived on site with required materials.' });

    expect(res.statusCode).toBe(200);
    expect(taskDoc.status).toBe('IN_PROGRESS');
    expect(ComplaintHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'IN_PROGRESS',
        newStatus: 'IN_PROGRESS',
      })
    );
  });

  // 4. Worker resolves complaint with photo evidence
  it('4. should allow worker to resolve IN_PROGRESS task with photo and remarks', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockWorker1);

    const taskDoc = {
      _id: new mongoose.Types.ObjectId(),
      complaintId: 'CC-2026-0003',
      status: 'IN_PROGRESS',
      assignedWorker: workerId1,
      resolutionRemarks: '',
      resolutionImages: [],
      resolutionImageDetails: [],
      save: jest.fn().mockResolvedValue(true),
    };

    jest.spyOn(Complaint, 'findById').mockResolvedValue(taskDoc);
    jest.spyOn(ComplaintHistory, 'create').mockResolvedValue(true);

    const res = await request(app)
      .patch(`/api/workers/complaints/${taskDoc._id}/resolve`)
      .set('Authorization', `Bearer ${workerToken1}`)
      .send({
        resolutionRemarks: 'Replaced broken pipeline section and repaved with concrete.',
        resolutionImageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a',
      });

    expect(res.statusCode).toBe(200);
    expect(taskDoc.status).toBe('RESOLVED');
    expect(taskDoc.resolutionRemarks).toContain('Replaced broken pipeline');
    expect(taskDoc.resolutionImages.length).toBe(1);
    expect(ComplaintHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'RESOLVED',
        newStatus: 'RESOLVED',
      })
    );
  });

  // 5. Resolution without completion photo rejected
  it('5. should reject resolution attempt if no completion photograph is provided (400)', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockWorker1);

    const taskDoc = {
      _id: new mongoose.Types.ObjectId(),
      complaintId: 'CC-2026-0004',
      status: 'IN_PROGRESS',
      assignedWorker: workerId1,
    };

    jest.spyOn(Complaint, 'findById').mockResolvedValue(taskDoc);

    const res = await request(app)
      .patch(`/api/workers/complaints/${taskDoc._id}/resolve`)
      .set('Authorization', `Bearer ${workerToken1}`)
      .send({
        resolutionRemarks: 'Work was finished, but no photo attached.',
        // missing resolutionImageUrl / req.files
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('At least one completion photograph is required');
  });

  // 6. Citizen cannot access worker endpoints
  it('6. should block citizen role from worker endpoints with 403 Forbidden', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockCitizen);

    const res = await request(app)
      .get('/api/workers/complaints')
      .set('Authorization', `Bearer ${citizenToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
