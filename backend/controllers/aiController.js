// ==============================================================================
// AI Civic Controller (aiController.js)
// Exposes endpoints for complaint classification, duplicate detection,
// automated SLA tracking, predictive hotspots, and citizen assistant interactions
// ==============================================================================

const {
  classifyComplaintText,
  detectNearbyDuplicates,
  answerCivicAssistantInquiry,
  computeCivicHotspots,
} = require('../services/aiCivicService');
const Complaint = require('../models/Complaint');

/**
 * POST /api/ai/classify
 * Classifies complaint title/description and returns category, department, priority, and suggestions
 */
exports.classifyComplaint = async (req, res) => {
  try {
    const { title = '', description = '', location = '' } = req.body;

    const analysis = classifyComplaintText({ title, description, location });

    return res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (err) {
    console.error('Classification Controller Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to process complaint classification',
      error: err.message,
    });
  }
};

/**
 * POST /api/ai/check-duplicates
 * Identifies potential duplicate or related complaints nearby
 */
exports.checkDuplicates = async (req, res) => {
  try {
    const { title, description, category, latitude, longitude, excludeId } = req.body;

    const duplicates = await detectNearbyDuplicates({
      title,
      description,
      category,
      latitude: Number(latitude),
      longitude: Number(longitude),
      excludeId,
    });

    return res.status(200).json({
      success: true,
      hasPotentialDuplicates: duplicates.length > 0,
      count: duplicates.length,
      data: duplicates,
    });
  } catch (err) {
    console.error('Duplicate Detection Controller Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to check duplicate complaints',
      error: err.message,
    });
  }
};

/**
 * POST /api/ai/assistant
 * Handles citizen conversational Q&A and civic guidance
 */
exports.assistantInquiry = async (req, res) => {
  try {
    const { query = '', language = 'en' } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter is required',
      });
    }

    const response = answerCivicAssistantInquiry(query, language);

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (err) {
    console.error('AI Assistant Controller Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to process assistant inquiry',
      error: err.message,
    });
  }
};

/**
 * GET /api/ai/hotspots
 * Retrieves predictive recurring problem hotspots
 */
exports.getHotspots = async (req, res) => {
  try {
    const hotspots = await computeCivicHotspots();

    return res.status(200).json({
      success: true,
      count: hotspots.length,
      data: hotspots,
    });
  } catch (err) {
    console.error('Hotspot Controller Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to compute predictive hotspots',
      error: err.message,
    });
  }
};

/**
 * GET /api/ai/escalations
 * Identifies active complaints that have breached or are approaching SLA deadlines
 */
exports.getEscalations = async (req, res) => {
  try {
    const now = new Date();
    const overdueQuery = {
      status: { $in: ['SUBMITTED', 'UNDER_VERIFICATION', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS'] },
      $or: [
        { isEscalated: true },
        { slaDeadline: { $lt: now } },
      ],
    };

    const overdueComplaints = await Complaint.find(overdueQuery)
      .populate('citizen', 'name email phone')
      .populate('assignedWorker', 'name email phone')
      .sort({ slaDeadline: 1 })
      .limit(50)
      .lean();

    const formatted = overdueComplaints.map((c) => {
      const deadline = c.slaDeadline ? new Date(c.slaDeadline) : null;
      const hoursOverdue = deadline ? Math.max(0, Math.round((now - deadline) / (1000 * 60 * 60))) : 0;
      return {
        ...c,
        hoursOverdue,
        escalationBadge: hoursOverdue > 24 ? 'CRITICAL_BREACH' : 'OVERDUE',
      };
    });

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (err) {
    console.error('Escalation Controller Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve escalated complaints',
      error: err.message,
    });
  }
};

