// ==============================================================================
// Central API Router (Mounted at /api)
// ==============================================================================

const express = require('express');
const router = express.Router();

const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const complaintRoutes = require('./complaintRoutes');
const adminComplaintRoutes = require('./adminComplaintRoutes');
const workerComplaintRoutes = require('./workerComplaintRoutes');

// Active API Routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/complaints', complaintRoutes);
router.use('/admin/complaints', adminComplaintRoutes);
router.use('/workers/complaints', workerComplaintRoutes);

// Root /api information endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to CivicConnect REST API',
    version: '1.0.0',
    phase: 'Phase 5 - Complaint Management, Cloudinary Photos & Geospatial Implemented',
    endpoints: {
      health: '/api/health',
      auth: {
        register: '/api/auth/register',
        login: '/api/auth/login',
        me: '/api/auth/me (Protected)',
        logout: '/api/auth/logout',
      },
      citizenComplaints: {
        create: 'POST /api/complaints',
        myComplaints: 'GET /api/complaints/my',
        details: 'GET /api/complaints/:id',
        update: 'PATCH /api/complaints/:id',
        history: 'GET /api/complaints/:id/history',
      },
      adminComplaints: {
        listAll: 'GET /api/admin/complaints',
        stats: 'GET /api/admin/complaints/stats',
        verify: 'PATCH /api/admin/complaints/:id/verify',
        reject: 'PATCH /api/admin/complaints/:id/reject',
        assignWorker: 'PATCH /api/admin/complaints/:id/assign',
        changePriority: 'PATCH /api/admin/complaints/:id/priority',
      },
      workerComplaints: {
        listAssigned: 'GET /api/workers/complaints',
        details: 'GET /api/workers/complaints/:id',
        startWork: 'PATCH /api/workers/complaints/:id/start',
        resolve: 'PATCH /api/workers/complaints/:id/resolve',
      },
    },
  });
});

module.exports = router;
