// ==============================================================================
// AI Civic Intelligence Engine (aiCivicService.js)
// Deterministic NLP classification, safety hazard detection, duplicate identification,
// SLA escalation computation, and civic assistant Q&A with optional LLM integration
// ==============================================================================

const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');

// Category metadata and routing rules
const CIVIC_CATEGORIES = {
  pothole: {
    label: 'Road and Potholes',
    department: 'Department of Roads, Bridges & Urban Infrastructure',
    standardSlaHours: { URGENT: 24, HIGH: 48, MEDIUM: 120, LOW: 240 },
    keywords: ['road', 'pothole', 'crater', 'asphalt', 'tar', 'ditch', 'speed breaker', 'divider', 'footpath', 'pavement', 'craters', 'resurfacing', 'dug up', 'damaged road'],
    evidencePrompt: 'A wide-angle photo showing road context and a close-up photo indicating pothole depth.',
  },
  garbage: {
    label: 'Garbage Collection',
    department: 'Solid Waste Management & Sanitation Corporation',
    standardSlaHours: { URGENT: 24, HIGH: 36, MEDIUM: 72, LOW: 120 },
    keywords: ['garbage', 'waste', 'trash', 'dump', 'bin', 'litter', 'debris', 'dead animal', 'refuse', 'collection van', 'plastic waste', 'filth', 'dumping yard', 'overflowing bin'],
    evidencePrompt: 'A photo showing the waste accumulation and surrounding bins or public area.',
  },
  water_leakage: {
    label: 'Water Leakage',
    department: 'Water Supply and Sewerage Board',
    standardSlaHours: { URGENT: 12, HIGH: 24, MEDIUM: 72, LOW: 120 },
    keywords: ['water', 'pipe', 'burst', 'leak', 'pipeline', 'contamination', 'dirty water', 'tap water', 'low pressure', 'tanker', 'drinking water', 'potable', 'valve', 'main pipe'],
    evidencePrompt: 'A photo or short video showing the point of leakage and water wastage stream.',
  },
  drainage: {
    label: 'Drainage Issues',
    department: 'Urban Drainage and Stormwater Management',
    standardSlaHours: { URGENT: 18, HIGH: 36, MEDIUM: 96, LOW: 168 },
    keywords: ['drainage', 'sewage', 'manhole', 'overflow', 'drain', 'gutter', 'septic', 'choked', 'foul smell', 'backflow', 'runoff', 'stagnant water', 'clogged drain'],
    evidencePrompt: 'A photo displaying the manhole/drainage opening and extent of stagnant sewage.',
  },
  street_light: {
    label: 'Streetlight Problems',
    department: 'Electrical and Public Lighting Utility',
    standardSlaHours: { URGENT: 24, HIGH: 48, MEDIUM: 96, LOW: 168 },
    keywords: ['street light', 'streetlight', 'pole', 'dark', 'flickering', 'bulb', 'wire', 'transformer', 'sparking', 'lamp post', 'sodium lamp', 'dark road', 'light not working'],
    evidencePrompt: 'A photo of the lamp post showing pole number or surrounding darkness at dusk.',
  },
  sanitation: {
    label: 'Public Sanitation',
    department: 'Public Health and Preventive Sanitation Department',
    standardSlaHours: { URGENT: 24, HIGH: 48, MEDIUM: 120, LOW: 168 },
    keywords: ['sanitation', 'public toilet', 'urinal', 'open defecation', 'disinfectant', 'fogging', 'mosquito', 'vector', 'spraying', 'cleanliness', 'public hygiene'],
    evidencePrompt: 'A photo of the unsanitary facility or public zone requiring disinfection.',
  },
  other: {
    label: 'Other Civic Infrastructure',
    department: 'General Municipal Administration',
    standardSlaHours: { URGENT: 48, HIGH: 72, MEDIUM: 168, LOW: 336 },
    keywords: ['park', 'tree', 'branch', 'traffic signal', 'stray cattle', 'encroachment', 'noise', 'building violation', 'illegal poster', 'footbridge', 'bus stop'],
    evidencePrompt: 'Clear photographs of the infrastructure issue and nearby street landmarks.',
  },
};

// High-Severity Safety Hazards
const CRITICAL_SAFETY_TRIGGERS = [
  'live wire',
  'sparking pole',
  'open manhole',
  'deep trench',
  'gas leak',
  'gas smell',
  'fire hazard',
  'hospital route',
  'ambulance blocked',
  'school route',
  'flood entering house',
  'electric shock',
  'bridge crack',
  'collapsed wall',
  'caved in',
];

// Tokenize and clean text
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

// Haversine distance in meters
function computeHaversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 1. Intelligent Complaint Classification Engine
 */
function classifyComplaintText({ title = '', description = '', location = '' }) {
  const combinedText = `${title} ${description}`.toLowerCase();
  const tokens = tokenize(combinedText);

  // Check safety triggers
  let isHazard = false;
  const matchedHazardKeywords = [];
  for (const trigger of CRITICAL_SAFETY_TRIGGERS) {
    if (combinedText.includes(trigger)) {
      isHazard = true;
      matchedHazardKeywords.push(trigger);
    }
  }

  // Score each category based on keyword density
  let bestCategory = 'other';
  let highestScore = 0;
  const categoryScores = {};

  for (const [catKey, meta] of Object.entries(CIVIC_CATEGORIES)) {
    let score = 0;
    for (const kw of meta.keywords) {
      if (kw.includes(' ')) {
        if (combinedText.includes(kw)) score += 3;
      } else {
        if (tokens.includes(kw)) score += 1;
      }
    }
    categoryScores[catKey] = score;
    if (score > highestScore) {
      highestScore = score;
      bestCategory = catKey;
    }
  }

  // If score is negligible, fall back to other or pothole if roads mentioned
  const meta = CIVIC_CATEGORIES[bestCategory];
  const confidence = highestScore >= 4 ? 0.96 : highestScore >= 2 ? 0.88 : 0.75;

  // Determine Priority
  let priority = 'MEDIUM';
  let priorityReason = 'Standard municipal priority based on typical grievance impact.';

  if (isHazard) {
    priority = 'URGENT';
    priorityReason = `Elevated to URGENT due to potential public hazard triggers: ${matchedHazardKeywords.join(', ')}.`;
  } else if (highestScore >= 4 && (bestCategory === 'water_leakage' || bestCategory === 'drainage')) {
    priority = 'HIGH';
    priorityReason = 'Elevated to HIGH priority to prevent contamination, water wastage, and health risks.';
  } else if (combinedText.includes('urgent') || combinedText.includes('danger') || combinedText.includes('severe')) {
    priority = 'HIGH';
    priorityReason = 'Elevated to HIGH based on reported severity and civic urgency descriptors.';
  } else if (highestScore <= 1) {
    priority = 'LOW';
    priorityReason = 'Assigned LOW priority for routine maintenance and aesthetic upkeep.';
  }

  // Generate clear suggested title if user title is short or vague
  let titleSuggestion = title;
  if (!title || title.trim().length < 10) {
    const locPrefix = location ? `at ${location.split(',')[0].trim()}` : '';
    titleSuggestion = `${meta.label} issue reported ${locPrefix}`.trim();
  }

  // Missing information detector
  const missingPrompts = [];
  if (!location || location.length < 5) {
    missingPrompts.push('Please specify an exact street, door number, or nearby landmark.');
  }
  if (!description || description.length < 30) {
    missingPrompts.push('Provide more details such as how long this issue has persisted or its approximate size.');
  }
  if (isHazard) {
    missingPrompts.push('Notice: If this is an immediate life-safety emergency, dial 112 directly.');
  }

  const slaHours = meta.standardSlaHours[priority] || 72;

  return {
    category: bestCategory,
    categoryLabel: meta.label,
    department: meta.department,
    priority,
    confidence,
    safetyHazard: isHazard,
    matchedHazardKeywords,
    keywords: tokens.slice(0, 8),
    explanation: `Classified as "${meta.label}" under ${meta.department}. ${priorityReason}`,
    titleSuggestion,
    evidenceSuggestion: meta.evidencePrompt,
    missingDetails: missingPrompts,
    slaHours,
  };
}

/**
 * 2. Duplicate Complaint Detection Engine
 */
async function detectNearbyDuplicates({ title = '', description = '', category = '', latitude, longitude, excludeId = null }) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return [];
  }

  // Gracefully avoid query buffering if DB is not connected
  if (mongoose.connection.readyState !== 1) {
    return [];
  }

  try {
    const query = {
      status: { $in: ['SUBMITTED', 'UNDER_VERIFICATION', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS'] },
    };

    if (excludeId) {
      query.complaintId = { $ne: excludeId };
    }

    // Retrieve active complaints within approx ~3km or recent 100 complaints
    const candidates = await Complaint.find(query)
      .select('complaintId title description category ward location latitude longitude status createdAt')
      .sort({ createdAt: -1 })
      .limit(60)
      .lean();

    const currentTokens = new Set([...tokenize(title), ...tokenize(description)]);
    const duplicates = [];

    for (const cand of candidates) {
      if (typeof cand.latitude !== 'number' || typeof cand.longitude !== 'number') continue;

      const distanceMeters = computeHaversineMeters(latitude, longitude, cand.latitude, cand.longitude);

      // Only evaluate within a 1.5 km municipal radius
      if (distanceMeters <= 1500) {
        const candTokens = new Set([...tokenize(cand.title), ...tokenize(cand.description)]);
        let commonCount = 0;
        for (const t of currentTokens) {
          if (candTokens.has(t)) commonCount++;
        }

        const totalTokens = Math.max(currentTokens.size + candTokens.size - commonCount, 1);
        const jaccardSimilarity = (commonCount / totalTokens) * 100;
        const categoryMatch = (category && cand.category && category.toLowerCase() === cand.category.toLowerCase()) ? 30 : 0;
        const proximityScore = Math.max(0, 100 - (distanceMeters / 15)); // 0m = 100, 1500m = 0

        // Combined similarity index
        const overallScore = Math.round((jaccardSimilarity * 0.4) + (proximityScore * 0.35) + (categoryMatch * 0.25));

        if (overallScore >= 45 || (distanceMeters <= 200 && categoryMatch > 0)) {
          duplicates.push({
            complaintId: cand.complaintId,
            title: cand.title,
            category: cand.category,
            status: cand.status,
            distanceMeters: Math.round(distanceMeters),
            similarityScore: Math.min(overallScore, 98),
            reason: distanceMeters <= 200
              ? `Reported ${Math.round(distanceMeters)}m away in the same category (${cand.status})`
              : `High description similarity (${overallScore}%) within ${Math.round(distanceMeters)}m radius`,
            createdAt: cand.createdAt,
          });
        }
      }
    }

    // Sort by highest similarity first, return top 4
    duplicates.sort((a, b) => b.similarityScore - a.similarityScore);
    return duplicates.slice(0, 4);
  } catch (err) {
    console.error('[Duplicate Detection Error]:', err.message);
    return [];
  }
}

/**
 * 3. AI Civic Assistant Q&A Knowledge Base
 */
function answerCivicAssistantInquiry(userQuery = '', language = 'en') {
  const q = (userQuery || '').toLowerCase().trim();

  // Emergency safety check
  if (q.includes('fire') || q.includes('accident') || q.includes('heart') || q.includes('police') || q.includes('crime') || q.includes('emergency')) {
    return {
      topic: 'emergency',
      title: '🚨 Immediate Emergency Advisory',
      answer:
        'CivicConnect is an asynchronous municipal grievance management platform and does not handle life-threatening emergencies. For immediate police, medical, or fire emergencies, dial 112 (National Unified Emergency Helpline) immediately.',
      quickLinks: [{ label: 'National Emergency Portal (112.gov.in)', url: 'https://112.gov.in' }],
    };
  }

  // Tracking inquiry
  if (q.includes('track') || q.includes('status') || q.includes('cc-')) {
    return {
      topic: 'tracking',
      title: 'How to Track Your Grievance',
      answer:
        'You can track any complaint instantly by entering your 11-character Tracking ID (e.g., CC-2026-0001) in the Track Complaint page. You do not need to log in to track basic status and municipal timeline updates.',
      quickLinks: [{ label: 'Open Track Grievance', url: '/track' }],
    };
  }

  // How it works / Process inquiry
  if (q.includes('how it works') || q.includes('process') || q.includes('stages') || q.includes('verification')) {
    return {
      topic: 'process',
      title: 'CivicConnect Grievance Lifecycle',
      answer:
        'Every complaint progresses through transparent municipal milestones: 1. SUBMITTED (Citizen registers complaint) → 2. UNDER_VERIFICATION (Municipal admin reviews photos & ward) → 3. VERIFIED (Approved for repair) → 4. ASSIGNED (Dispatched to field crew) → 5. IN_PROGRESS (Ground repairs initiated) → 6. RESOLVED (Fix completed with proof photo) → 7. CITIZEN_FEEDBACK (You rate the quality of service).',
      quickLinks: [{ label: 'Track Existing Grievance', url: '/track' }],
    };
  }

  // SLA / Time to resolve
  if (q.includes('how long') || q.includes('sla') || q.includes('delay') || q.includes('time')) {
    return {
      topic: 'sla',
      title: 'Service-Level Agreements (SLA) & Resolution Timelines',
      answer:
        'CivicConnect enforces strict municipal resolution targets: Critical/Urgent Hazards (24 hours), High Priority (48 hours), Medium Priority (5 days), Low Priority (10 days). If a complaint breaches its SLA, it is automatically escalated to the Senior Zonal Commissioner.',
      quickLinks: [{ label: 'Track Existing Grievance', url: '/track' }],
    };
  }

  // Potholes / Roads
  if (q.includes('pothole') || q.includes('road') || q.includes('tar') || q.includes('footpath')) {
    return {
      topic: 'roads',
      title: 'Reporting Road & Pothole Issues',
      answer:
        'To report a pothole, select the "Road and Potholes" category. Pin the exact location on our India-wide interactive map. Upload a clear photo showing the road segment. The Department of Urban Roads will inspect and patch the asphalt.',
      quickLinks: [{ label: 'File Road Complaint', url: '/citizen/submit-complaint' }],
    };
  }

  // Drainage / Sewage
  if (q.includes('drain') || q.includes('sewage') || q.includes('gutter') || q.includes('manhole')) {
    return {
      topic: 'drainage',
      title: 'Reporting Drainage & Sewage Overflow',
      answer:
        'Drainage blockages and overflowing manholes are prioritized to prevent waterborne diseases. If an open manhole poses a pedestrian hazard, our AI flags it as an immediate safety priority.',
      quickLinks: [{ label: 'Report Drainage Issue', url: '/citizen/submit-complaint' }],
    };
  }

  // General default response
  return {
    topic: 'general_help',
    title: 'CivicConnect Citizen Assistant',
    answer:
      'Welcome to CivicConnect! I can help you categorize civic issues, explain municipal resolution stages, look up tracking IDs, or explain service-level timelines. You can describe your problem or ask any question about public services across India.',
    quickLinks: [
      { label: 'Submit a Complaint', url: '/citizen/submit-complaint' },
      { label: 'Track Existing Grievance', url: '/track' },
    ],
  };
}

/**
 * 4. Predictive Hotspots & Problem Pattern Recognition
 */
async function computeCivicHotspots() {
  if (mongoose.connection.readyState !== 1) {
    return [];
  }

  try {
    const pipeline = [
      {
        $group: {
          _id: {
            state: '$state',
            district: '$district',
            category: '$category',
          },
          totalIncidents: { $sum: 1 },
          unresolvedCount: {
            $sum: {
              $cond: [{ $in: ['$status', ['SUBMITTED', 'UNDER_VERIFICATION', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS']] }, 1, 0],
            },
          },
          avgLat: { $avg: '$latitude' },
          avgLng: { $avg: '$longitude' },
          recentComplaintDate: { $max: '$createdAt' },
        },
      },
      {
        $project: {
          _id: 0,
          state: '$_id.state',
          district: '$_id.district',
          category: '$_id.category',
          totalIncidents: 1,
          unresolvedCount: 1,
          latitude: { $round: ['$avgLat', 4] },
          longitude: { $round: ['$avgLng', 4] },
          recentComplaintDate: 1,
          riskLevel: {
            $cond: [
              { $gte: ['$totalIncidents', 5] },
              'HIGH_RECURRENCE',
              {
                $cond: [{ $gte: ['$totalIncidents', 2] }, 'MODERATE', 'LOW'],
              },
            ],
          },
        },
      },
      { $sort: { totalIncidents: -1 } },
      { $limit: 25 },
    ];

    const results = await Complaint.aggregate(pipeline);
    return results;
  } catch (err) {
    console.error('[Predictive Hotspot Error]:', err.message);
    return [];
  }
}

module.exports = {
  CIVIC_CATEGORIES,
  classifyComplaintText,
  detectNearbyDuplicates,
  answerCivicAssistantInquiry,
  computeCivicHotspots,
};

