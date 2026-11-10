// ==============================================================================
// Geo Routes (geoRoutes.js)
// Forward & Reverse Geocoding Endpoints across India
// ==============================================================================

const express = require('express');
const router = express.Router();
const geoController = require('../controllers/geoController');

// GET /api/geo/search?q=...&limit=...
router.get('/search', geoController.searchLocations);

// GET /api/geo/reverse?lat=...&lng=...
router.get('/reverse', geoController.reverseGeocode);

module.exports = router;

