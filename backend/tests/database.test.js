// ==============================================================================
// Database & Mongoose Schema Test Suite (database.test.js)
// ==============================================================================

const mongoose = require('mongoose');
const { isDBConnected, disconnectDB } = require('../config/database');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Feedback = require('../models/Feedback');

describe('CivicConnect Database & Mongoose Model Validation Tests', () => {
  afterAll(async () => {
    await disconnectDB();
  });

  // Test 1: isDBConnected returns boolean
  it('should accurately report database connection state as boolean', () => {
    const connected = isDBConnected();
    expect(typeof connected).toBe('boolean');
  });

  // Test 2: User Model Required Field Validation
  it('should fail validation when required User fields are missing', () => {
    const invalidUser = new User({});
    const validationError = invalidUser.validateSync();
    expect(validationError).toBeDefined();
    expect(validationError.errors.fullName).toBeDefined();
    expect(validationError.errors.email).toBeDefined();
    expect(validationError.errors.password).toBeDefined();
  });

  // Test 3: User Model Email Format Validation
  it('should reject malformed email address in User model', () => {
    const invalidUser = new User({
      fullName: 'Rahul Sharma',
      email: 'not-a-valid-email',
      password: 'password123',
      mobileNumber: '+919876543210',
      address: 'Ward 4',
    });
    const validationError = invalidUser.validateSync();
    expect(validationError).toBeDefined();
    expect(validationError.errors.email).toBeDefined();
  });

  // Test 4: Complaint Model Validation
  it('should fail validation when required Complaint fields are missing', () => {
    const invalidComplaint = new Complaint({});
    const validationError = invalidComplaint.validateSync();
    expect(validationError).toBeDefined();
    expect(validationError.errors.title).toBeDefined();
    expect(validationError.errors.category).toBeDefined();
    expect(validationError.errors.location).toBeDefined();
    expect(validationError.errors.citizen).toBeDefined();
  });

  // Test 5: Complaint ID Static Generator Format
  it('should generate complaint ID adhering to CC-YYYY-XXXX format', async () => {
    const id = await Complaint.generateComplaintId();
    const currentYear = new Date().getFullYear();
    expect(id).toMatch(new RegExp(`^CC-${currentYear}-\\d{4}$`));
  });

  // Test 6: Feedback Rating Boundary Validation
  it('should reject feedback ratings lower than 1 or higher than 5', () => {
    const invalidLow = new Feedback({
      complaint: new mongoose.Types.ObjectId(),
      citizen: new mongoose.Types.ObjectId(),
      rating: 0,
      comment: 'Very poor',
    });
    const errorLow = invalidLow.validateSync();
    expect(errorLow.errors.rating).toBeDefined();

    const invalidHigh = new Feedback({
      complaint: new mongoose.Types.ObjectId(),
      citizen: new mongoose.Types.ObjectId(),
      rating: 6,
      comment: 'Superb',
    });
    const errorHigh = invalidHigh.validateSync();
    expect(errorHigh.errors.rating).toBeDefined();
  });
});

