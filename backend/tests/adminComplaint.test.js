// ==============================================================================
// Municipal Administrator Complaint Test Suite (adminComplaint.test.js)
// ==============================================================================

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const ComplaintHistory = require('../models/ComplaintHistory');
const { generateToken } = require('../utils/tokenUtils');

describe('CivicConnect Phase 5 - Municipal Admin Complaint Test Suite', () => {
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
    email: 'rahul.citizen@example.com',
    role: 'citizen',
    isActive: true,
  };

  const mockWorker = {
    _id: workerId,
    fullName: 'Ramesh Patel',
    email: 'worker@civicconnect.org',
    role: 'worker',
    isActive: true,
  };

  const adminToken = generateToken(mockAdmin);
  const citizenToken = generateToken(mockCitizen);

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // 1. Admin views all complaints with pagination
  it('1. should allow admin to view all complaints with pagination metadata', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockAdmin);

    const mockComplaints = [
      {
        _id: new mongoose.Types.ObjectId(),
        complaintId: 'CC-2026-0001',
        title: 'Deep road pothole',
        status: 'SUBMITTED',
        citizen: mockCitizen,
      },
    ];

    const sortMock = jest.fn().mockReturnThis();
    const skipMock = jest.fn().mockReturnThis();
    const limitMock = jest.fn().mockReturnThis();
    const populateMock1 = jest.fn().mockReturnThis();
    const populateMock2 = jest.fn().mockResolvedValue(mockComplaints);

    jest.spyOn(Complaint, 'find').mockReturnValue({
      sort: sortMock,
      skip: skipMock,
      limit: limitMock,
      populate: populateMock1.mockReturnValue({ populate: populateMock2 }),
    });

    jest.spyOn(Complaint, 'countDocuments').mockResolvedValue(1);

    const res = await request(app)
      .get('/api/admin/complaints?page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.total).toBe(1);
    expect(res.body.data.length).toBe(1);
  });

  // 2. Citizen cannot access admin endpoint
  it('2. should forbid citizen from accessing GET /api/admin/complaints with 403', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockCitizen);

    const res = await request(app)
      .get('/api/admin/complaints')
      .set('Authorization', `Bearer ${citizenToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // 3. Admin verifies complaint
  it('3. should allow admin to verify a submitted complaint and log history', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockAdmin);

    const complaintDoc = {
      _id: new mongoose.Types.ObjectId(),
      complaintId: 'CC-2026-0002',
      status: 'SUBMITTED',
      save: jest.fn().mockResolvedValue(true),
    };

    jest.spyOn(Complaint, 'findById').mockResolvedValue(complaintDoc);
    jest.spyOn(ComplaintHistory, 'create').mockResolvedValue(true);

    const res = await request(app)
      .patch(`/api/admin/complaints/${complaintDoc._id}/verify`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ remarks: 'Valid civic issue verified by desk.' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('VERIFIED');
    expect(ComplaintHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'VERIFIED',
        newStatus: 'VERIFIED',
      })
    );
  });

  // 4. Admin rejects complaint with reason
  it('4. should allow admin to reject invalid complaint and require rejection reason', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockAdmin);

    const complaintDoc = {
      _id: new mongoose.Types.ObjectId(),
      complaintId: 'CC-2026-0003',
      status: 'SUBMITTED',
      rejectionReason: '',
      save: jest.fn().mockResolvedValue(true),
    };

    jest.spyOn(Complaint, 'findById').mockResolvedValue(complaintDoc);
    jest.spyOn(ComplaintHistory, 'create').mockResolvedValue(true);

    const res = await request(app)
      .patch(`/api/admin/complaints/${complaintDoc._id}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ rejectionReason: 'Duplicate complaint; scheduled in municipal maintenance plan.' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('REJECTED');
    expect(complaintDoc.rejectionReason).toContain('Duplicate complaint');
  });

  // 5. Rejection without reason fails
  it('5. should reject rejection attempt if rejectionReason is missing or too short (400)', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockAdmin);

    const res = await request(app)
      .patch(`/api/admin/complaints/${new mongoose.Types.ObjectId()}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ rejectionReason: 'bad' }); // Under 5 characters

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // 6. Admin assigns active worker
  it('6. should allow admin to assign a verified complaint to a municipal field worker', async () => {
    jest.spyOn(User, 'findById')
      .mockImplementation((id) => {
        if (id.toString() === adminId.toString()) return Promise.resolve(mockAdmin);
        if (id.toString() === workerId.toString()) return Promise.resolve(mockWorker);
        return Promise.resolve(null);
      });

    const complaintDoc = {
      _id: new mongoose.Types.ObjectId(),
      complaintId: 'CC-2026-0004',
      status: 'VERIFIED',
      priority: 'MEDIUM',
      assignedWorker: null,
      save: jest.fn().mockResolvedValue(true),
      populate: jest.fn().mockResolvedValue(true),
    };

    jest.spyOn(Complaint, 'findById').mockResolvedValue(complaintDoc);
    jest.spyOn(ComplaintHistory, 'create').mockResolvedValue(true);

    const res = await request(app)
      .patch(`/api/admin/complaints/${complaintDoc._id}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        workerId: workerId.toString(),
        priority: 'HIGH',
        remarks: 'Assigned to field maintenance crew.',
      });

    expect(res.statusCode).toBe(200);
    expect(complaintDoc.status).toBe('ASSIGNED');
    expect(complaintDoc.priority).toBe('HIGH');
  });

  // 7. Assignment to citizen account rejected
  it('7. should reject assignment if selected user is not a worker (400)', async () => {
    jest.spyOn(User, 'findById')
      .mockImplementation((id) => {
        if (id.toString() === adminId.toString()) return Promise.resolve(mockAdmin);
        if (id.toString() === citizenId.toString()) return Promise.resolve(mockCitizen); // Citizen, not worker!
        return Promise.resolve(null);
      });

    const complaintDoc = {
      _id: new mongoose.Types.ObjectId(),
      status: 'VERIFIED',
    };
    jest.spyOn(Complaint, 'findById').mockResolvedValue(complaintDoc);

    const res = await request(app)
      .patch(`/api/admin/complaints/${complaintDoc._id}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        workerId: citizenId.toString(),
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain("does not have the 'worker' role");
  });

  // 8. Admin changes priority
  it('8. should allow admin to update complaint priority level', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockAdmin);

    const complaintDoc = {
      _id: new mongoose.Types.ObjectId(),
      complaintId: 'CC-2026-0005',
      priority: 'LOW',
      status: 'VERIFIED',
      save: jest.fn().mockResolvedValue(true),
    };

    jest.spyOn(Complaint, 'findById').mockResolvedValue(complaintDoc);
    jest.spyOn(ComplaintHistory, 'create').mockResolvedValue(true);

    const res = await request(app)
      .patch(`/api/admin/complaints/${complaintDoc._id}/priority`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        priority: 'URGENT',
      });

    expect(res.statusCode).toBe(200);
    expect(complaintDoc.priority).toBe('URGENT');
  });

  // 9. Admin stats endpoint
  it('9. should return accurate aggregated counts on GET /api/admin/complaints/stats', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockAdmin);
    jest.spyOn(Complaint, 'countDocuments').mockResolvedValue(5);

    const res = await request(app)
      .get('/api/admin/complaints/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total).toBe(5);
  });
});
