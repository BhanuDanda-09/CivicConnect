// ==============================================================================
// Civic Asset Routes (assetRoutes.js)
// ==============================================================================

const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public lookup for QR code scans
router.get('/:assetId', assetController.getAssetById);
router.get('/', assetController.getAssets);

// Admin asset registration
router.post('/', protect, authorize('admin'), assetController.createAsset);

module.exports = router;

