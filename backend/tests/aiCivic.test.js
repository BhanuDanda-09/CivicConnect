// ==============================================================================
// AI Civic Intelligence, Asset & Community Test Suite (aiCivic.test.js)
// ==============================================================================

const request = require('supertest');
const app = require('../app');
const {
  classifyComplaintText,
  detectNearbyDuplicates,
  answerCivicAssistantInquiry,
} = require('../services/aiCivicService');
const Complaint = require('../models/Complaint');
const Asset = require('../models/Asset');
const AuditLog = require('../models/AuditLog');
const { recordAudit } = require('../services/auditService');

describe('AI Civic Intelligence & Smart Governance Suite', () => {
  // 1. NLP Classification for Roads & Potholes
  it('1. classifies road damage and potholes with appropriate municipal department and SLA', () => {
    const analysis = classifyComplaintText({
      title: 'Massive crater in the middle of Main Road',
      description: 'The asphalt has caved in creating a deep pothole. Vehicles are getting damaged.',
      location: 'Banjara Hills, Hyderabad',
    });

    expect(analysis.category).toBe('pothole');
    expect(analysis.categoryLabel).toBe('Road and Potholes');
    expect(analysis.department).toContain('Roads');
    expect(analysis.confidence).toBeGreaterThan(0.7);
    expect(analysis.slaHours).toBeDefined();
  });

  // 2. Safety Hazard Detection & Priority Elevation
  it('2. detects critical safety hazards and elevates priority to URGENT', () => {
    const hazardAnalysis = classifyComplaintText({
      title: 'Danger: live wire sparking near school gate',
      description: 'An electrical pole fell and there is a live wire touching the puddle where children walk.',
      location: 'Anna Nagar, Chennai',
    });

    expect(hazardAnalysis.safetyHazard).toBe(true);
    expect(hazardAnalysis.priority).toBe('URGENT');
    expect(hazardAnalysis.matchedHazardKeywords).toContain('live wire');
    expect(hazardAnalysis.missingDetails.some((d) => d.includes('112'))).toBe(true);
  });

  // 3. Water and Drainage Classification
  it('3. accurately differentiates water pipeline bursts and sewage overflow', () => {
    const waterAnalysis = classifyComplaintText({
      title: 'Clean drinking water pipe burst',
      description: 'The main drinking water supply pipeline is leaking gallons of fresh water onto the street.',
      location: 'Indiranagar, Bengaluru',
    });
    expect(waterAnalysis.category).toBe('water_leakage');

    const drainageAnalysis = classifyComplaintText({
      title: 'Gutter overflow and choked manhole',
      description: 'Black foul-smelling sewage is backing up out of the drainage manhole onto the footpath.',
      location: 'Kothrud, Pune',
    });
    expect(drainageAnalysis.category).toBe('drainage');
    expect(drainageAnalysis.department).toContain('Drainage');
  });

  // 4. Civic Assistant Safety & 112 Advisory
  it('4. provides explicit 112 emergency helpline advisory for life-threatening queries', () => {
    const fireResponse = answerCivicAssistantInquiry('There is a major fire in the commercial building!');
    expect(fireResponse.topic).toBe('emergency');
    expect(fireResponse.answer).toContain('112');

    const medicalResponse = answerCivicAssistantInquiry('Need emergency police or ambulance assistance immediately');
    expect(medicalResponse.answer).toContain('112');
  });

  // 5. Civic Assistant Tracking & Lifecycle Assistance
  it('5. guides citizens on tracking grievance IDs and understanding lifecycle stages', () => {
    const trackResponse = answerCivicAssistantInquiry('How do I track my grievance CC-2026-0001?');
    expect(trackResponse.topic).toBe('tracking');
    expect(trackResponse.answer).toContain('Tracking ID');

    const stagesResponse = answerCivicAssistantInquiry('What are the stages of complaint verification?');
    expect(stagesResponse.topic).toBe('process');
    expect(stagesResponse.answer).toContain('SUBMITTED');
    expect(stagesResponse.answer).toContain('RESOLVED');
  });

  // 6. API Route: POST /api/ai/classify
  it('6. exposes POST /api/ai/classify returning structured NLP recommendations', async () => {
    const res = await request(app)
      .post('/api/ai/classify')
      .send({
        title: 'Street lights not working for the past 3 days',
        description: 'The entire residential lane is pitch dark at night, causing safety concerns.',
        location: 'Jubilee Hills, Hyderabad',
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.category).toBe('street_light');
    expect(res.body.data.department).toContain('Lighting');
    expect(res.body.data.slaHours).toBeDefined();
  });

  // 7. API Route: POST /api/ai/assistant
  it('7. exposes POST /api/ai/assistant returning verified municipal answers', async () => {
    const res = await request(app)
      .post('/api/ai/assistant')
      .send({ query: 'What is the SLA timeline for pothole repairs?' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.answer).toBeDefined();
    expect(res.body.data.quickLinks).toBeInstanceOf(Array);
  });

  // 8. Public Transparency Metrics: GET /api/community/transparency
  it('8. provides public governance transparency statistics and SLA adherence rates', async () => {
    jest.spyOn(Complaint, 'countDocuments').mockImplementation((filter) => {
      if (filter && filter.status === 'RESOLVED') return Promise.resolve(25);
      if (filter && filter.isEscalated) return Promise.resolve(3);
      return Promise.resolve(30);
    });

    jest.spyOn(Complaint, 'aggregate').mockResolvedValue([
      { category: 'pothole', count: 15 },
      { category: 'water_leakage', count: 10 },
      { category: 'drainage', count: 5 },
    ]);

    const res = await request(app)
      .get('/api/community/transparency')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.totalComplaints).toBe(30);
    expect(res.body.data.resolvedComplaints).toBe(25);
    expect(res.body.data.slaAdherenceRate).toBe(90);
    expect(res.body.data.categoryStats).toBeInstanceOf(Array);
  });

  // 9. Civic Asset Model & Lookup: GET /api/assets/:assetId
  it('9. registers and resolves public civic infrastructure assets for QR reporting', async () => {
    // Validate Asset Schema
    const validAsset = new Asset({
      assetId: 'SL-HYD-0412',
      name: 'High-Mast LED Light Pole #4',
      category: 'STREETLIGHT',
      ward: 'Ward 4 - South Green Park',
      location: 'Near Community Center Gate',
      state: 'Telangana',
      district: 'Hyderabad',
      city: 'Hyderabad',
      latitude: 17.385,
      longitude: 78.486,
    });
    expect(validAsset.validateSync()).toBeUndefined();

    // Mock findOne for route test
    jest.spyOn(Asset, 'findOne').mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          assetId: 'SL-HYD-0412',
          name: 'High-Mast LED Light Pole #4',
          category: 'STREETLIGHT',
          ward: 'Ward 4 - South Green Park',
          location: 'Near Community Center Gate',
          status: 'OPERATIONAL',
        }),
      }),
    });

    const res = await request(app)
      .get('/api/assets/SL-HYD-0412')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.assetId).toBe('SL-HYD-0412');
    expect(res.body.data.category).toBe('STREETLIGHT');
  });

  // 10. Audit Log Schema & Recording Validation
  it('10. validates and creates immutable administrative security audit records', async () => {
    const validAudit = new AuditLog({
      action: 'UPDATE_PRIORITY',
      performedBy: '507f1f77bcf86cd799439011',
      performedByRole: 'admin',
      targetEntity: 'Complaint',
      targetId: 'CC-2026-9812',
      details: { previousPriority: 'MEDIUM', newPriority: 'URGENT', reason: 'High-risk safety hazard' },
      ipAddress: '103.21.244.2',
    });

    expect(validAudit.validateSync()).toBeUndefined();
    expect(validAudit.action).toBe('UPDATE_PRIORITY');
    expect(validAudit.targetEntity).toBe('Complaint');
  });

  // 11. Security Audit Trail Access Control
  it('11. protects audit log endpoint from unauthorized or unauthenticated requests', async () => {
    const res = await request(app)
      .get('/api/admin/complaints/audit-logs')
      .expect(401);

    expect(res.body.success).toBe(false);
  });
});
