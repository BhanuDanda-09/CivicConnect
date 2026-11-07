// ==============================================================================
// Development Database Seed Script (seedUsers.js)
// Safely seeds initial Admin and Municipal Worker accounts
// Run with: npm run seed
// ==============================================================================

const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const { connectDB, disconnectDB } = require('../config/database');
const User = require('../models/User');

const seedUsers = async () => {
  try {
    console.log('------------------------------------------------------------');
    console.log('🌱 [CivicConnect Seed] Starting administrative account seeding...');
    await connectDB();

    // 1. Seed Municipal Admin Account
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@civicconnect.org').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        fullName: 'Priya Deshmukh',
        email: adminEmail,
        password: adminPassword, // Hashed automatically by pre-save hook
        mobileNumber: '+91 98111 22334',
        address: 'Municipal Corporation Head Office, Ward 1',
        ward: 'Ward 1 - Central Market & Bus Terminal',
        role: 'admin',
        isActive: true,
      });
      console.log(`✅ [CivicConnect Seed] Admin account created: ${admin.email} (Role: ADMIN)`);
    } else {
      console.log(`ℹ️  [CivicConnect Seed] Admin account already exists: ${admin.email}`);
    }

    // 2. Seed Municipal Field Worker Account
    const workerEmail = (process.env.WORKER_EMAIL || 'worker@civicconnect.org').toLowerCase().trim();
    const workerPassword = process.env.WORKER_PASSWORD || 'Worker@12345';

    let worker = await User.findOne({ email: workerEmail });
    if (!worker) {
      worker = await User.create({
        fullName: 'Ramesh Patel',
        email: workerEmail,
        password: workerPassword, // Hashed automatically by pre-save hook
        mobileNumber: '+91 97222 33445',
        address: 'Municipal Maintenance Quarters, Ward 4',
        ward: 'Ward 4 - South Green Park & Lake View',
        role: 'worker',
        isActive: true,
      });
      console.log(`✅ [CivicConnect Seed] Field Worker account created: ${worker.email} (Role: WORKER)`);
    } else {
      console.log(`ℹ️  [CivicConnect Seed] Worker account already exists: ${worker.email}`);
    }

    // 3. Seed Demo Citizen Account (for immediate testing)
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
      console.log(`✅ [CivicConnect Seed] Demo Citizen account created: ${citizen.email} (Role: CITIZEN)`);
    } else {
      console.log(`ℹ️  [CivicConnect Seed] Citizen account already exists: ${citizen.email}`);
    }

    console.log('🎉 [CivicConnect Seed] Seeding completed successfully!');
    console.log('------------------------------------------------------------');
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ [CivicConnect Seed Error] Seeding failed:', error.message);
    await disconnectDB();
    process.exit(1);
  }
};

seedUsers();
