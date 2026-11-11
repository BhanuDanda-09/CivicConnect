// ==============================================================================
// Civic Asset Controller (assetController.js)
// Enables QR code asset lookups, public asset registration, and maintenance tracking
// ==============================================================================

const Asset = require('../models/Asset');
const Complaint = require('../models/Complaint');

/**
 * GET /api/assets/:assetId
 * Resolves registered asset details by QR / Asset ID
 */
exports.getAssetById = async (req, res) => {
  try {
    const rawId = (req.params.assetId || '').trim().toUpperCase();

    const asset = await Asset.findOne({ assetId: rawId })
      .populate('relatedComplaints', 'complaintId title status createdAt priority')
      .lean();

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: `No public civic asset found with ID: ${rawId}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: asset,
    });
  } catch (err) {
    console.error('Asset Lookup Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve asset details',
      error: err.message,
    });
  }
};

/**
 * GET /api/assets
 * Lists registered civic assets with optional filters
 */
exports.getAssets = async (req, res) => {
  try {
    const { category, status, ward, search } = req.query;
    const filter = {};

    if (category) filter.category = category.toUpperCase();
    if (status) filter.status = status.toUpperCase();
    if (ward) filter.ward = ward;
    if (search) {
      filter.$or = [
        { assetId: new RegExp(search, 'i') },
        { name: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') },
      ];
    }

    const assets = await Asset.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.status(200).json({
      success: true,
      count: assets.length,
      data: assets,
    });
  } catch (err) {
    console.error('List Assets Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve assets list',
      error: err.message,
    });
  }
};

/**
 * POST /api/assets
 * Admin endpoint to register a new public infrastructure asset
 */
exports.createAsset = async (req, res) => {
  try {
    const {
      assetId,
      name,
      category,
      ward,
      location,
      state,
      district,
      city,
      pincode,
      latitude,
      longitude,
      notes,
    } = req.body;

    if (!assetId || !name || !category || !ward || !location) {
      return res.status(400).json({
        success: false,
        message: 'assetId, name, category, ward, and location are required',
      });
    }

    const cleanId = assetId.trim().toUpperCase();
    const existing = await Asset.findOne({ assetId: cleanId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `An asset with ID ${cleanId} already exists.`,
      });
    }

    const newAsset = await Asset.create({
      assetId: cleanId,
      name: name.trim(),
      category: category.toUpperCase(),
      ward: ward.trim(),
      location: location.trim(),
      state: state || 'Telangana',
      district: district || 'Hyderabad',
      city: city || 'Hyderabad',
      pincode: pincode || '',
      latitude: latitude ? Number(latitude) : 17.3850,
      longitude: longitude ? Number(longitude) : 78.4867,
      notes: notes || '',
    });

    return res.status(201).json({
      success: true,
      message: 'Civic asset registered successfully',
      data: newAsset,
    });
  } catch (err) {
    console.error('Create Asset Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to register civic asset',
      error: err.message,
    });
  }
};

