// ==============================================================================
// Community & Public Governance Routes (communityRoutes.js)
// ==============================================================================

const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// Public Feed with optional authenticated user context (to show if current user upvoted)
router.get('/feed', optionalAuth, communityController.getCommunityFeed);

// Protected Community Action
router.post('/:complaintId/upvote', protect, communityController.toggleUpvote);

module.exports = router;

