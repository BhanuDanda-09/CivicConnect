// ==============================================================================
// Community & Public Governance Controller (communityController.js)
// Privacy-sanitized public civic issue feed, community upvoting, and transparency metrics
// ==============================================================================

const Complaint = require('../models/Complaint');

/**
 * Sanitizes complaint data to preserve citizen privacy:
 * Strips phone, email, full name, and sensitive private address markers
 */
function sanitizePublicComplaint(complaint, currentUserId = null) {
  const isUpvoted =
    currentUserId && Array.isArray(complaint.communityUpvotes)
      ? complaint.communityUpvotes.some((uid) => uid.toString() === currentUserId.toString())
      : false;

  return {
    complaintId: complaint.complaintId,
    title: complaint.title,
    description: complaint.description,
    category: complaint.category,
    categoryLabel: complaint.categoryLabel,
    ward: complaint.ward,
    location: complaint.location,
    city: complaint.city,
    district: complaint.district,
    state: complaint.state,
    latitude: complaint.latitude,
    longitude: complaint.longitude,
    status: complaint.status,
    priority: complaint.priority,
    images: complaint.images || [],
    resolutionImages: complaint.resolutionImages || [],
    resolutionRemarks: complaint.resolutionRemarks || '',
    upvoteCount: complaint.upvoteCount || (complaint.communityUpvotes ? complaint.communityUpvotes.length : 0),
    isUpvoted,
    createdAt: complaint.createdAt,
    updatedAt: complaint.updatedAt,
  };
}

/**
 * GET /api/community/feed
 * Privacy-safe public complaint stream for civic awareness
 */
exports.getCommunityFeed = async (req, res) => {
  try {
    const { district, state, category, ward, limit = 20, page = 1 } = req.query;
    const filter = { isPublic: { $ne: false } };

    if (district) filter.district = district;
    if (state) filter.state = state;
    if (category) filter.category = category;
    if (ward) filter.ward = ward;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .lean();

    const currentUserId = req.user ? req.user._id : null;
    const sanitized = complaints.map((c) => sanitizePublicComplaint(c, currentUserId));

    const total = await Complaint.countDocuments(filter);

    return res.status(200).json({
      success: true,
      count: sanitized.length,
      total,
      data: sanitized,
    });
  } catch (err) {
    console.error('Community Feed Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve community feed',
      error: err.message,
    });
  }
};

/**
 * POST /api/community/:complaintId/upvote
 * Allows citizens to upvote ("I have this problem too") to emphasize priority
 */
exports.toggleUpvote = async (req, res) => {
  try {
    const rawId = (req.params.complaintId || '').trim();
    const userId = req.user._id;

    const complaint = await Complaint.findOne({
      $or: [{ complaintId: rawId.toUpperCase() }, { _id: rawId }],
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    if (!Array.isArray(complaint.communityUpvotes)) {
      complaint.communityUpvotes = [];
    }

    const index = complaint.communityUpvotes.findIndex((id) => id.toString() === userId.toString());
    let upvoted = false;

    if (index === -1) {
      complaint.communityUpvotes.push(userId);
      upvoted = true;
    } else {
      complaint.communityUpvotes.splice(index, 1);
      upvoted = false;
    }

    complaint.upvoteCount = complaint.communityUpvotes.length;
    await complaint.save();

    return res.status(200).json({
      success: true,
      upvoted,
      upvoteCount: complaint.upvoteCount,
      message: upvoted ? 'Upvote registered. Thank you for building community awareness.' : 'Upvote removed.',
    });
  } catch (err) {
    console.error('Toggle Upvote Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update community upvote',
      error: err.message,
    });
  }
};

/**
 * GET /api/community/transparency
 * Returns public governance metrics and SLA compliance statistics
 */
exports.getPublicTransparency = async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const resolvedComplaints = await Complaint.countDocuments({ status: 'RESOLVED' });
    const inProgressComplaints = await Complaint.countDocuments({
      status: { $in: ['ASSIGNED', 'IN_PROGRESS'] },
    });
    const pendingComplaints = await Complaint.countDocuments({
      status: { $in: ['SUBMITTED', 'UNDER_VERIFICATION', 'VERIFIED'] },
    });

    // Category distribution
    const categoryStats = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { category: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    // SLA Compliance Estimation
    const escalatedCount = await Complaint.countDocuments({ isEscalated: true });
    const slaAdherenceRate = totalComplaints > 0
      ? Math.max(0, Math.round(((totalComplaints - escalatedCount) / totalComplaints) * 100))
      : 100;

    // Monthly Trends (Past 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrends = await Complaint.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'RESOLVED'] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedTrends = Array.isArray(monthlyTrends)
      ? monthlyTrends
          .filter((m) => m && m._id && typeof m._id.month === 'number')
          .map((m) => ({
            month: `${monthNames[m._id.month] || 'Month'} ${m._id.year || new Date().getFullYear()}`,
            total: m.total || 0,
            resolved: m.resolved || 0,
          }))
      : [];

    return res.status(200).json({
      success: true,
      data: {
        totalComplaints,
        resolvedComplaints,
        inProgressComplaints,
        pendingComplaints,
        resolutionRate: totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0,
        slaAdherenceRate,
        categoryStats,
        monthlyTrends: formattedTrends,
      },
    });
  } catch (err) {
    console.error('Transparency Metrics Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve transparency metrics',
      error: err.message,
    });
  }
};
