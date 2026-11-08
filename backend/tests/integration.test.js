// ==============================================================================
// Phase 7 Integration Test Suite (integration.test.js)
// Citizen Feedback, Real-time Notifications, Socket events & System Hardening
// ==============================================================================

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Feedback = require('../models/Feedback');
const Notification = require('../models/Notification');
const ComplaintHistory = require('../models/ComplaintHistory');
const { generateToken } = require('../utils/tokenUtils');

describe('CivicConnect Phase 7 - Integration, Notifications & Feedback Test Suite', () => {
  const citizenId = new mongoose.Types.ObjectId();
  const otherCitizenId = new mongoose.Types.ObjectId();
  const adminId = new mongoose.Types.ObjectId();
  const workerId = new mongoose.Types.ObjectId();
  const complaintId = new mongoose.Types.ObjectId();
  const notificationId = new mongoose.Types.ObjectId();

  const mockCitizen = {
    _id: citizenId,
    fullName: 'Rahul Sharma',
    email: 'rahul.citizen@example.com',
    role: 'citizen',
    isActive: true,
  };

  const mockOtherCitizen = {
    _id: otherCitizenId,
    fullName: 'Ananya Roy',
    email: 'ananya@example.com',
    role: 'citizen',
    isActive: true,
  };

  const mockAdmin = {
    _id: adminId,
    fullName: 'Priya Deshmukh',
    email: 'admin@civicconnect.org',
    role: 'admin',
    isActive: true,
  };

  const mockWorker = {
    _id: workerId,
    fullName: 'Ramesh Patel',
    email: 'ramesh.worker@civicconnect.org',
    role: 'worker',
    isActive: true,
  };

  const citizenToken = generateToken(mockCitizen);
  const otherCitizenToken = generateToken(mockOtherCitizen);
  const adminToken = generateToken(mockAdmin);

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // 1. Submit citizen feedback for a resolved complaint
  it('1. should allow citizen owner to submit rating and feedback for a resolved complaint', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockCitizen);

    const resolvedComplaint = {
      _id: complaintId,
      complaintId: 'CC-2026-0042',
      title: 'Damaged storm drain cover',
      status: 'RESOLVED',
      citizen: citizenId,
      assignedWorker: workerId,
      ward: 'Ward 1',
      save: jest.fn().mockResolvedValue(true),
    };

    jest.spyOn(Complaint, 'findById').mockResolvedValue(resolvedComplaint);
    jest.spyOn(Feedback, 'findOne').mockResolvedValue(null);
    jest.spyOn(Feedback, 'create').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      complaint: complaintId,
      citizen: citizenId,
      rating: 5,
      comment: 'Excellent and quick resolution by municipal worker!',
    });
    jest.spyOn(ComplaintHistory, 'create').mockResolvedValue(true);

    const res = await request(app)
      .post(`/api/complaints/${complaintId}/feedback`)
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        rating: 5,
        comment: 'Excellent and quick resolution by municipal worker!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rating).toBe(5);
    expect(resolvedComplaint.status).toBe('CITIZEN_FEEDBACK');
  });

  // 2. Reject feedback if complaint is not resolved
  it('2. should reject feedback submission if complaint is not yet in RESOLVED status', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockCitizen);

    const pendingComplaint = {
      _id: complaintId,
      complaintId: 'CC-2026-0043',
      status: 'IN_PROGRESS',
      citizen: citizenId,
    };

    jest.spyOn(Complaint, 'findById').mockResolvedValue(pendingComplaint);

    const res = await request(app)
      .post(`/api/complaints/${complaintId}/feedback`)
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        rating: 4,
        comment: 'Too early to tell',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Feedback can only be submitted for resolved complaints');
  });

  // 3. Reject duplicate feedback
  it('3. should reject duplicate feedback submission with 409 Conflict', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockCitizen);

    const resolvedComplaint = {
      _id: complaintId,
      status: 'RESOLVED',
      citizen: citizenId,
    };

    jest.spyOn(Complaint, 'findById').mockResolvedValue(resolvedComplaint);
    jest.spyOn(Feedback, 'findOne').mockResolvedValue({ _id: new mongoose.Types.ObjectId() });

    const res = await request(app)
      .post(`/api/complaints/${complaintId}/feedback`)
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        rating: 5,
        comment: 'Submitting feedback again',
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain('already been recorded');
  });

  // 4. Forbidden if not owner
  it('4. should reject feedback from another citizen with 403 Forbidden', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockOtherCitizen);

    const resolvedComplaint = {
      _id: complaintId,
      status: 'RESOLVED',
      citizen: citizenId, // Belongs to Rahul, not Ananya
    };

    jest.spyOn(Complaint, 'findById').mockResolvedValue(resolvedComplaint);

    const res = await request(app)
      .post(`/api/complaints/${complaintId}/feedback`)
      .set('Authorization', `Bearer ${otherCitizenToken}`)
      .send({
        rating: 5,
        comment: 'Trying to rate someone else complaint',
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Forbidden');
  });

  // 5. Retrieve feedback for a complaint
  it('5. should retrieve feedback details for a specific complaint', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockCitizen);

    const complaint = {
      _id: complaintId,
      citizen: citizenId,
    };

    jest.spyOn(Complaint, 'findById').mockResolvedValue(complaint);
    jest.spyOn(Feedback, 'findOne').mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        rating: 5,
        comment: 'Great job!',
        citizen: { fullName: 'Rahul Sharma' },
      }),
    });

    const res = await request(app)
      .get(`/api/complaints/${complaintId}/feedback`)
      .set('Authorization', `Bearer ${citizenToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rating).toBe(5);
  });

  // 6. Admin retrieves all municipal feedback
  it('6. should allow admin to view municipal satisfaction analytics and all feedback', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockAdmin);

    const sortMock = jest.fn().mockReturnThis();
    const skipMock = jest.fn().mockReturnThis();
    const limitMock = jest.fn().mockReturnThis();
    const pop1Mock = jest.fn().mockReturnThis();
    const pop2Mock = jest.fn().mockResolvedValue([
      {
        _id: new mongoose.Types.ObjectId(),
        rating: 5,
        comment: 'Repaired within 24 hours!',
        citizen: { fullName: 'Rahul Sharma' },
        complaint: { complaintId: 'CC-2026-0042', ward: 'Ward 1' },
      },
    ]);

    jest.spyOn(Feedback, 'find').mockReturnValue({
      sort: sortMock,
      skip: skipMock,
      limit: limitMock,
      populate: pop1Mock.mockReturnValue({ populate: pop2Mock }),
    });

    jest.spyOn(Feedback, 'countDocuments').mockResolvedValue(1);
    jest.spyOn(Feedback, 'aggregate').mockResolvedValue([{ _id: null, avgRating: 4.85, total: 1 }]);

    const res = await request(app)
      .get('/api/feedback')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.averageRating).toBe(4.85);
    expect(res.body.total).toBe(1);
  });

  // 7. Citizen cannot access all municipal feedback (Admin only)
  it('7. should forbid citizens from querying all feedback via /api/feedback', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockCitizen);

    const res = await request(app)
      .get('/api/feedback')
      .set('Authorization', `Bearer ${citizenToken}`);

    expect(res.status).toBe(403);
  });

  // 8. Notifications listing
  it('8. should list notifications with unread count for authenticated user', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockCitizen);

    const sortMock = jest.fn().mockReturnThis();
    const skipMock = jest.fn().mockReturnThis();
    const limitMock = jest.fn().mockReturnThis();
    const popMock = jest.fn().mockResolvedValue([
      {
        _id: notificationId,
        title: 'Grievance Verified',
        message: 'Your complaint CC-2026-0042 was approved',
        isRead: false,
        type: 'VERIFICATION',
      },
    ]);

    jest.spyOn(Notification, 'find').mockReturnValue({
      sort: sortMock,
      skip: skipMock,
      limit: limitMock,
      populate: popMock,
    });

    jest.spyOn(Notification, 'countDocuments').mockImplementation((filter) => {
      if (filter && filter.isRead === false) return Promise.resolve(1);
      return Promise.resolve(1); // total
    });

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${citizenToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.unreadCount).toBe(1);
    expect(res.body.data[0].title).toBe('Grievance Verified');
  });

  // 9. Mark single notification as read
  it('9. should mark a single notification as read and update unread count', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockCitizen);

    const mockNotif = {
      _id: notificationId,
      recipient: citizenId,
      title: 'Grievance Verified',
      isRead: false,
      save: jest.fn().mockResolvedValue(true),
    };

    jest.spyOn(Notification, 'findOne').mockResolvedValue(mockNotif);
    jest.spyOn(Notification, 'countDocuments').mockResolvedValue(0);

    const res = await request(app)
      .patch(`/api/notifications/${notificationId}/read`)
      .set('Authorization', `Bearer ${citizenToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.unreadCount).toBe(0);
    expect(mockNotif.isRead).toBe(true);
  });

  // 10. Mark all notifications as read
  it('10. should mark all notifications as read', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockCitizen);
    jest.spyOn(Notification, 'updateMany').mockResolvedValue({ modifiedCount: 3 });

    const res = await request(app)
      .patch('/api/notifications/read-all')
      .set('Authorization', `Bearer ${citizenToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.unreadCount).toBe(0);
  });

  // 11. Unauthorized notification access without token
  it('11. should return 401 Unauthorized when notifications requested without token', async () => {
    const res = await request(app).get('/api/notifications');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

