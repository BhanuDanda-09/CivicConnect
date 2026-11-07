// ==============================================================================
// Citizen Complaint Test Suite (complaint.test.js)
// ==============================================================================

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const ComplaintHistory = require('../models/ComplaintHistory');
const { generateToken } = require('../utils/tokenUtils');

describe('CivicConnect Phase 5 - Citizen Complaint Test Suite', () => {
  const citizenId1 = new mongoose.Types.ObjectId();
  const citizenId2 = new mongoose.Types.ObjectId();
  const workerId = new mongoose.Types.ObjectId();
  const adminId = new mongoose.Types.ObjectId();

  const mockCitizen1 = {
    _id: citizenId1,
    fullName: 'Rahul Sharma',
    email: 'rahul.citizen@example.com',
    role: 'citizen',
    isActive: true,
  };

  const mockCitizen2 = {
    _id: citizenId2,
    fullName: 'Ananya Sen',
    email: 'ananya@example.com',
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

  const mockAdmin = {
    _id: adminId,
    fullName: 'Priya Deshmukh',
    email: 'admin@civicconnect.org',
    role: 'admin',
    isActive: true,
  };

  const citizenToken1 = generateToken(mockCitizen1);
  const citizenToken2 = generateToken(mockCitizen2);
  const workerToken = generateToken(mockWorker);

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // 1. Citizen successfully creates complaint
  it('1. should allow authenticated citizen to submit complaint with valid fields and coordinates', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockCitizen1);
    jest.spyOn(Complaint.prototype, 'save').mockResolvedValue(true);
    jest.spyOn(ComplaintHistory, 'create').mockResolvedValue(true);

    const payload = {
      title: 'Deep road pothole near metro station',
      description: 'A deep crater-like pothole has appeared causing severe bicycle and vehicular damage.',
      category: 'pothole',
      location: 'Near Metro Station Pillar 42, Green Park Road',
      ward: 'Ward 4 - South Green Park',
      latitude: 18.5204,
      longitude: 73.8567,
      imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7',
    };

    const res = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${citizenToken1}`)
      .send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.complaintId).toMatch(/^CC-\d{4}-\d+$/);
    expect(res.body.data.status).toBe('SUBMITTED');
    expect(res.body.data.citizen.toString()).toBe(citizenId1.toString());
  });

  // 2. Unauthenticated user cannot create complaint
  it('2. should reject complaint creation without JWT token with 401', async () => {
    const res = await request(app).post('/api/complaints').send({
      title: 'Deep road pothole near metro station',
      description: 'A deep crater-like pothole has appeared causing severe damage.',
      category: 'pothole',
      location: 'Main MG Road',
      ward: 'Ward 1',
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // 3. Worker cannot create citizen complaint
  it('3. should block worker role from creating a citizen complaint with 403 Forbidden', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockWorker);

    const res = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        title: 'Deep road pothole near metro station',
        description: 'A deep crater-like pothole has appeared causing severe damage.',
        category: 'pothole',
        location: 'Main MG Road',
        ward: 'Ward 1',
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // 4. Missing required fields rejected
  it('4. should reject complaint creation with missing required fields with 400', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockCitizen1);

    const res = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${citizenToken1}`)
      .send({
        title: 'Short',
        // missing description, category, location, ward
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // 5. Invalid category rejected
  it('5. should reject complaint creation with invalid category with 400', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockCitizen1);

    const res = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${citizenToken1}`)
      .send({
        title: 'Valid complaint title exceeding minimum',
        description: 'Detailed description exceeding minimum character length requirements.',
        category: 'non_existent_alien_invasion_category',
        location: 'Main street',
        ward: 'Ward 1',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // 6. Invalid latitude / longitude rejected
  it('6. should reject invalid latitude out of bounds (-90 to 90) with 400', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockCitizen1);

    const res = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${citizenToken1}`)
      .send({
        title: 'Valid complaint title exceeding minimum',
        description: 'Detailed description exceeding minimum character length requirements.',
        category: 'garbage',
        location: 'Main street',
        ward: 'Ward 1',
        latitude: 195.5, // Invalid > 90
        longitude: 73.85,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // 7. Citizen can view own complaints
  it('7. should allow citizen to retrieve list of only their own submitted complaints', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockCitizen1);

    const mockComplaints = [
      {
        _id: new mongoose.Types.ObjectId(),
        complaintId: 'CC-2026-0001',
        title: 'My road repair grievance',
        status: 'SUBMITTED',
        citizen: citizenId1,
      },
    ];

    const sortMock = jest.fn().mockReturnThis();
    const populateMock = jest.fn().mockResolvedValue(mockComplaints);
    jest.spyOn(Complaint, 'find').mockReturnValue({
      sort: sortMock,
      populate: populateMock,
    });

    const res = await request(app)
      .get('/api/complaints/my')
      .set('Authorization', `Bearer ${citizenToken1}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].complaintId).toBe('CC-2026-0001');
  });

  // 8. Citizen cannot view another citizen's private complaint
  it('8. should forbid citizen from viewing another citizen private complaint (403)', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockCitizen1);

    const otherComplaint = {
      _id: new mongoose.Types.ObjectId(),
      complaintId: 'CC-2026-0099',
      title: 'Private grievance of citizen 2',
      citizen: citizenId2, // Owned by citizen 2
      assignedWorker: null,
      status: 'SUBMITTED',
      populate: jest.fn().mockResolvedValue(this),
    };

    jest.spyOn(Complaint, 'findById').mockResolvedValue(otherComplaint);

    const res = await request(app)
      .get(`/api/complaints/${otherComplaint._id}`)
      .set('Authorization', `Bearer ${citizenToken1}`); // Requested by citizen 1

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // 9. Citizen can update permitted details in SUBMITTED status
  it('9. should allow citizen to update title/description while in SUBMITTED status', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockCitizen1);

    const complaintDoc = {
      _id: new mongoose.Types.ObjectId(),
      complaintId: 'CC-2026-0010',
      title: 'Original Title',
      description: 'Original Description',
      status: 'SUBMITTED',
      citizen: citizenId1,
      landmark: '',
      save: jest.fn().mockResolvedValue(true),
    };

    jest.spyOn(Complaint, 'findById').mockResolvedValue(complaintDoc);
    jest.spyOn(ComplaintHistory, 'create').mockResolvedValue(true);

    const res = await request(app)
      .patch(`/api/complaints/${complaintDoc._id}`)
      .set('Authorization', `Bearer ${citizenToken1}`)
      .send({
        title: 'Updated Title by Citizen',
        landmark: 'Near Tree',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.title).toBe('Updated Title by Citizen');
    expect(res.body.data.landmark).toBe('Near Tree');
  });

  // 10. Citizen cannot directly manipulate status
  it('10. should ignore or forbid direct status tampering by citizen on update', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockCitizen1);

    const complaintDoc = {
      _id: new mongoose.Types.ObjectId(),
      complaintId: 'CC-2026-0012',
      title: 'Original Title',
      status: 'SUBMITTED',
      citizen: citizenId1,
      save: jest.fn().mockResolvedValue(true),
    };

    jest.spyOn(Complaint, 'findById').mockResolvedValue(complaintDoc);
    jest.spyOn(ComplaintHistory, 'create').mockResolvedValue(true);

    const res = await request(app)
      .patch(`/api/complaints/${complaintDoc._id}`)
      .set('Authorization', `Bearer ${citizenToken1}`)
      .send({
        status: 'RESOLVED', // Malicious attempt to self-resolve
      });

    expect(res.statusCode).toBe(200);
    expect(complaintDoc.status).toBe('SUBMITTED'); // Status must NOT change!
  });
});
