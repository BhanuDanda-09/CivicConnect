// ==============================================================================
// Complete Database Seed Script (seedDatabase.js)
// Seeds Municipal Admin, Field Worker, Citizen, and Initial Civic Grievances
// Run with: npm --prefix backend run seed
// ==============================================================================

const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const { connectDB, disconnectDB } = require('../config/database');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const ComplaintHistory = require('../models/ComplaintHistory');

const seedDatabase = async () => {
  try {
    console.log('------------------------------------------------------------');
    console.log('🌱 [CivicConnect Seed] Starting complete database seeding...');
    await connectDB();

    // 1. Seed Municipal Admin Account
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@civicconnect.org').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        fullName: 'Priya Deshmukh',
        email: adminEmail,
        password: adminPassword,
        mobileNumber: '+91 98111 22334',
        address: 'Municipal Corporation Head Office, Ward 1',
        ward: 'Ward 1 - Central Market & Bus Terminal',
        role: 'admin',
        isActive: true,
      });
      console.log(`✅ [CivicConnect Seed] Admin account created: ${admin.email}`);
    } else {
      console.log(`ℹ️  [CivicConnect Seed] Admin account ready: ${admin.email}`);
    }

    // 2. Seed Municipal Field Worker Account
    const workerEmail = (process.env.WORKER_EMAIL || 'worker@civicconnect.org').toLowerCase().trim();
    const workerPassword = process.env.WORKER_PASSWORD || 'Worker@12345';

    let worker = await User.findOne({ email: workerEmail });
    if (!worker) {
      worker = await User.create({
        fullName: 'Ramesh Patel',
        email: workerEmail,
        password: workerPassword,
        mobileNumber: '+91 97222 33445',
        address: 'Municipal Maintenance Quarters, Ward 4',
        ward: 'Ward 4 - South Green Park & Lake View',
        role: 'worker',
        isActive: true,
      });
      console.log(`✅ [CivicConnect Seed] Field Worker account created: ${worker.email}`);
    } else {
      console.log(`ℹ️  [CivicConnect Seed] Field Worker account ready: ${worker.email}`);
    }

    // 3. Seed Demo Citizen Account
    const citizenEmail = (process.env.CITIZEN_EMAIL || 'citizen@civicconnect.org').toLowerCase().trim();
    const citizenPassword = process.env.CITIZEN_PASSWORD || 'Citizen@12345';

    let citizen = await User.findOne({ email: citizenEmail });
    if (!citizen) {
      citizen = await User.create({
        fullName: 'Rahul Sharma',
        email: citizenEmail,
        password: citizenPassword,
        mobileNumber: '+91 98765 43210',
        address: 'Flat 402, Lotus Heights, Ward 4',
        ward: 'Ward 4 - South Green Park & Lake View',
        role: 'citizen',
        isActive: true,
      });
      console.log(`✅ [CivicConnect Seed] Citizen account created: ${citizen.email}`);
    } else {
      console.log(`ℹ️  [CivicConnect Seed] Citizen account ready: ${citizen.email}`);
    }

    // 4. Seed Standard Sample Complaints (CC-2026-0001, CC-2026-0002, CC-2026-0003)
    const initialComplaints = [
      {
        complaintId: 'CC-2026-0001',
        title: 'Large deep pothole causing traffic slowdown near metro pillar 42',
        description: 'A 3-foot wide deep pothole has formed following heavy rains. Two two-wheelers have already skidded. Requires immediate asphalt patching.',
        category: 'pothole',
        categoryLabel: 'Road and Potholes',
        location: 'MG Road, near Pillar 42, Ward 1 - Central Market',
        ward: 'Ward 1 - Central Market & Bus Terminal',
        landmark: 'Opposite Metro Pillar 42',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        citizen: citizen._id,
        assignedWorker: worker._id,
        latitude: 18.5204,
        longitude: 73.8567,
        locationGeo: { type: 'Point', coordinates: [73.8567, 18.5204] },
        images: ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'],
        imageDetails: [{ url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80', publicId: '' }],
        timeline: [
          { status: 'SUBMITTED', remarks: 'Complaint filed by citizen with location and photograph.', actor: citizen._id },
          { status: 'UNDER_VERIFICATION', remarks: 'Municipal desk reviewing report validity and hazardous impact.', actor: admin._id },
          { status: 'VERIFIED', remarks: 'Verified as high urgency road hazard by municipal department.', actor: admin._id },
          { status: 'ASSIGNED', remarks: 'Dispatched to Municipal Field Officer Ramesh Patel.', actor: admin._id },
          { status: 'IN_PROGRESS', remarks: 'Road repair crew on site with hot-mix asphalt patching equipment.', actor: worker._id },
        ],
      },
      {
        complaintId: 'CC-2026-0002',
        title: 'Overflowing commercial garbage dumpsters behind Main Market',
        description: 'Solid waste has not been collected for three days. Stray animals are scattering trash across pedestrian footpaths and creating foul odors.',
        category: 'garbage',
        categoryLabel: 'Garbage Collection',
        location: 'Behind Vegetable Market, Shivaji Nagar',
        ward: 'Ward 2 - Shivaji Nagar North',
        landmark: 'Behind Vegetable Market',
        priority: 'URGENT',
        status: 'RESOLVED',
        citizen: citizen._id,
        assignedWorker: worker._id,
        latitude: 18.5314,
        longitude: 73.8446,
        locationGeo: { type: 'Point', coordinates: [73.8446, 18.5314] },
        images: ['https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80'],
        imageDetails: [{ url: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80', publicId: '' }],
        resolutionPhotos: ['https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80'],
        resolutionNotes: 'Commercial dumpsters cleared completely, washed, and disinfected with lime powder.',
        timeline: [
          { status: 'SUBMITTED', remarks: 'Complaint logged by citizen with photo evidence.', actor: citizen._id },
          { status: 'UNDER_VERIFICATION', remarks: 'Reviewed by sanitation dispatch unit.', actor: admin._id },
          { status: 'VERIFIED', remarks: 'Confirmed hygiene hazard and assigned for clearance.', actor: admin._id },
          { status: 'ASSIGNED', remarks: 'Compactor truck and sanitation team assigned.', actor: admin._id },
          { status: 'IN_PROGRESS', remarks: 'Sanitation team clearing overflow and spraying disinfectant.', actor: worker._id },
          { status: 'RESOLVED', remarks: 'Dumpsters emptied, area sanitized, and photographic proof uploaded.', actor: worker._id },
        ],
      },
      {
        complaintId: 'CC-2026-0003',
        title: 'Continuous drinking water leakage from underground pipe joint',
        description: 'Clean potable water has been gushing from the pavement joint for 24 hours. Thousands of liters wasted daily, reducing water pressure in nearby houses.',
        category: 'water_leakage',
        categoryLabel: 'Water Leakage',
        location: 'Plot 12, Green Park Avenue, Ward 4',
        ward: 'Ward 4 - South Green Park & Lake View',
        landmark: 'Near Green Park Community Gate',
        priority: 'HIGH',
        status: 'UNDER_VERIFICATION',
        citizen: citizen._id,
        assignedWorker: null,
        latitude: 18.4988,
        longitude: 73.8569,
        locationGeo: { type: 'Point', coordinates: [73.8569, 18.4988] },
        images: ['https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=800&q=80'],
        imageDetails: [{ url: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=800&q=80', publicId: '' }],
        timeline: [
          { status: 'SUBMITTED', remarks: 'Water leakage reported by citizen with GPS location.', actor: citizen._id },
          { status: 'UNDER_VERIFICATION', remarks: 'Water Supply Department verifying main valve coordinates.', actor: admin._id },
        ],
      },
    ];

    for (const cData of initialComplaints) {
      let complaint = await Complaint.findOne({ complaintId: cData.complaintId });
      if (!complaint) {
        const { timeline, ...complaintFields } = cData;
        complaint = await Complaint.create(complaintFields);
        console.log(`✅ [CivicConnect Seed] Complaint seeded: #${complaint.complaintId} - "${complaint.title.substring(0, 45)}..."`);

        // Seed audit history
        let previousStatus = null;
        for (const step of timeline) {
          await ComplaintHistory.create({
            complaint: complaint._id,
            action: step.status,
            previousStatus,
            newStatus: step.status,
            changedBy: step.actor,
            remarks: step.remarks,
            timestamp: new Date(),
          });
          previousStatus = step.status;
        }
      } else {
        console.log(`ℹ️  [CivicConnect Seed] Complaint already exists: #${complaint.complaintId}`);
      }
    }

    console.log('🎉 [CivicConnect Seed] Database seeded successfully with live sample records!');
    console.log('------------------------------------------------------------');
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ [CivicConnect Seed Error] Seeding failed:', error.message);
    await disconnectDB();
    process.exit(1);
  }
};

seedDatabase();

