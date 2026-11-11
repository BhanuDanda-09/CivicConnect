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
const adminAnalyticsRoutes = require('./adminAnalyticsRoutes');
const workerAnalyticsRoutes = require('./workerAnalyticsRoutes');
const adminWorkerRoutes = require('./adminWorkerRoutes');
const adminUserRoutes = require('./adminUserRoutes');
const notificationRoutes = require('./notificationRoutes');
const feedbackRoutes = require('./feedbackRoutes');
const geoRoutes = require('./geoRoutes');

// Active API Routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/complaints', complaintRoutes);
router.use('/admin/complaints', adminComplaintRoutes);
router.use('/admin/analytics', adminAnalyticsRoutes);
router.use('/admin/workers', adminWorkerRoutes);
router.use('/admin/users', adminUserRoutes);
router.use('/workers/complaints', workerComplaintRoutes);
router.use('/workers/analytics', workerAnalyticsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/geo', geoRoutes);

// Root /api information endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to CivicConnect REST API',
    version: '1.0.0',
    phase: 'Phase 7 - End-to-End Integration, Real-Time Notifications & Hardening Implemented',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (Protected)',
        logout: 'POST /api/auth/logout',
      },
      citizenComplaints: {
        create: 'POST /api/complaints',
        myComplaints: 'GET /api/complaints/my',
        details: 'GET /api/complaints/:id',
        update: 'PATCH /api/complaints/:id',
        history: 'GET /api/complaints/:id/history',
        feedback: 'POST /api/complaints/:id/feedback',
      },
      adminComplaints: {
        listAll: 'GET /api/admin/complaints',
        stats: 'GET /api/admin/complaints/stats',
        verify: 'PATCH /api/admin/complaints/:id/verify',
        reject: 'PATCH /api/admin/complaints/:id/reject',
        assignWorker: 'PATCH /api/admin/complaints/:id/assign',
        changePriority: 'PATCH /api/admin/complaints/:id/priority',
      },
      adminAnalytics: {
        overview: 'GET /api/admin/analytics/overview',
        workers: 'GET /api/admin/analytics/workers',
        wards: 'GET /api/admin/analytics/wards',
        locations: 'GET /api/admin/analytics/complaint-locations',
      },
      adminManagement: {
        workersList: 'GET /api/admin/workers',
        createWorker: 'POST /api/admin/workers',
        usersList: 'GET /api/admin/users',
        toggleUserStatus: 'PATCH /api/admin/users/:id/toggle-status',
        feedbackList: 'GET /api/feedback',
      },
      workerComplaints: {
        listAssigned: 'GET /api/workers/complaints',
        details: 'GET /api/workers/complaints/:id',
        startWork: 'PATCH /api/workers/complaints/:id/start',
        resolve: 'PATCH /api/workers/complaints/:id/resolve',
      },
      workerAnalytics: {
        overview: 'GET /api/workers/analytics/overview',
        locations: 'GET /api/workers/analytics/task-locations',
      },
      notifications: {
        list: 'GET /api/notifications',
        markRead: 'PATCH /api/notifications/:id/read',
        markAllRead: 'PATCH /api/notifications/read-all',
      },
      geo: {
        search: 'GET /api/geo/search?q=:query',
        reverse: 'GET /api/geo/reverse?lat=:lat&lng=:lng',
      },
    },
  });
});

module.exports = router;
