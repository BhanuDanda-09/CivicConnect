// ==============================================================================
// Centralized Mock Data & State Store for CivicConnect (Phase 2 Frontend Demo)
// ==============================================================================
import { CITY_WARDS } from './constants';
export { CITY_WARDS };

export const INITIAL_COMPLAINTS = [
  {
    id: "CC-2026-0001",
    complaintId: "CC-2026-0001",
    title: "Large deep pothole causing traffic slowdown near metro pillar 42",
    category: "pothole",
    categoryLabel: "Road and Potholes",
    description: "A 3-foot wide deep pothole has formed following last weekend's heavy rains. Two two-wheelers have already skidded. Requires immediate asphalt patching.",
    location: "MG Road, near Pillar 42, Ward 1 - Central Market",
    ward: "Ward 1 - Central Market & Bus Terminal",
    coordinates: { lat: 18.5204, lng: 73.8567 },
    status: "IN_PROGRESS",
    priority: "HIGH",
    citizenName: "Rahul Sharma",
    citizenEmail: "citizen@civicconnect.org",
    citizenPhone: "+91 98765 43210",
    imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    workInProgressImageUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=800&q=80",
    completionImageUrl: null,
    assignedWorker: {
      id: "usr_w301",
      name: "Ramesh Patel",
      phone: "+91 97222 33445",
      trade: "Roads & Public Works"
    },
    createdAt: "2026-11-04T09:30:00Z",
    updatedAt: "2026-11-06T14:15:00Z",
    timeline: [
      { status: "SUBMITTED", timestamp: "2026-11-04T09:30:00Z", note: "Complaint filed by citizen with location and photograph.", actor: "Rahul Sharma (Citizen)" },
      { status: "UNDER_VERIFICATION", timestamp: "2026-11-04T11:00:00Z", note: "Municipal desk reviewing report validity.", actor: "Civic AI / Desk Officer" },
      { status: "VERIFIED", timestamp: "2026-11-04T14:20:00Z", note: "Verified as high urgency road hazard.", actor: "Priya Deshmukh (Admin)" },
      { status: "ASSIGNED", timestamp: "2026-11-05T10:00:00Z", note: "Dispatched to Field Officer Ramesh Patel.", actor: "Priya Deshmukh (Admin)" },
      { status: "IN_PROGRESS", timestamp: "2026-11-06T14:15:00Z", note: "Road crew on site with hot-mix asphalt equipment.", actor: "Ramesh Patel (Worker)" }
    ],
    feedback: null
  },
  {
    id: "CC-2026-0002",
    complaintId: "CC-2026-0002",
    title: "Overflowing commercial garbage dumpsters behind Main Market",
    category: "garbage",
    categoryLabel: "Garbage Collection",
    description: "Solid waste has not been collected for three days. Stray animals are scattering trash across pedestrian footpaths and creating foul odors.",
    location: "Behind Vegetable Market, Shivaji Nagar",
    ward: "Ward 2 - Shivaji Nagar North",
    coordinates: { lat: 18.5314, lng: 73.8446 },
    status: "RESOLVED",
    priority: "URGENT",
    citizenName: "Rahul Sharma",
    citizenEmail: "citizen@civicconnect.org",
    citizenPhone: "+91 98765 43210",
    imageUrl: "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80",
    workInProgressImageUrl: null,
    completionImageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80",
    assignedWorker: {
      id: "usr_w302",
      name: "Suresh Gaikwad",
      phone: "+91 98333 44556",
      trade: "Waste Management"
    },
    createdAt: "2026-11-02T08:15:00Z",
    updatedAt: "2026-11-03T16:45:00Z",
    timeline: [
      { status: "SUBMITTED", timestamp: "2026-11-02T08:15:00Z", note: "Complaint logged by citizen.", actor: "Rahul Sharma (Citizen)" },
      { status: "UNDER_VERIFICATION", timestamp: "2026-11-02T09:00:00Z", note: "Reviewed by sanitation desk.", actor: "Civic Desk" },
      { status: "VERIFIED", timestamp: "2026-11-02T10:30:00Z", note: "Confirmed hygiene hazard.", actor: "Priya Deshmukh (Admin)" },
      { status: "ASSIGNED", timestamp: "2026-11-02T11:00:00Z", note: "Compactor truck #14 assigned.", actor: "Priya Deshmukh (Admin)" },
      { status: "IN_PROGRESS", timestamp: "2026-11-03T10:00:00Z", note: "Truck loading garbage and sanitizing area.", actor: "Suresh Gaikwad (Worker)" },
      { status: "RESOLVED", timestamp: "2026-11-03T16:45:00Z", note: "Dumpsters cleared, area bleached, photo proof attached.", actor: "Suresh Gaikwad (Worker)" }
    ],
    feedback: {
      rating: 5,
      comment: "Prompt response! Cleared within 36 hours. Very happy with the resolution.",
      submittedAt: "2026-11-04T12:00:00Z"
    }
  },
  {
    id: "CC-2026-0003",
    complaintId: "CC-2026-0003",
    title: "Continuous drinking water leakage from underground pipe joint",
    category: "water_leakage",
    categoryLabel: "Water Leakage",
    description: "Clean potable water has been gushing from the pavement joint for 24 hours. Thousands of liters wasted daily, reducing water pressure in nearby houses.",
    location: "Plot 12, Green Park Avenue, Ward 4",
    ward: "Ward 4 - South Green Park & Lake View",
    coordinates: { lat: 18.4988, lng: 73.8569 },
    status: "VERIFIED",
    priority: "HIGH",
    citizenName: "Sunita Roy",
    citizenEmail: "sunita@example.com",
    citizenPhone: "+91 99887 76655",
    imageUrl: "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=800&q=80",
    workInProgressImageUrl: null,
    completionImageUrl: null,
    assignedWorker: null,
    createdAt: "2026-11-05T16:20:00Z",
    updatedAt: "2026-11-06T09:00:00Z",
    timeline: [
      { status: "SUBMITTED", timestamp: "2026-11-05T16:20:00Z", note: "Complaint filed.", actor: "Sunita Roy (Citizen)" },
      { status: "UNDER_VERIFICATION", timestamp: "2026-11-05T17:00:00Z", note: "Sent to Water Supply Engineering division.", actor: "Desk Officer" },
      { status: "VERIFIED", timestamp: "2026-11-06T09:00:00Z", note: "Awaiting worker dispatch.", actor: "Priya Deshmukh (Admin)" }
    ],
    feedback: null
  },
  {
    id: "CC-2026-0830",
    title: "Broken street light pole with dangling wiring on 5th Cross Road",
    category: "street_light",
    categoryLabel: "Streetlight Problems",
    description: "After high winds, the light fixture is hanging by its wire. Completely dark street at night, posing safety risk for pedestrians and children.",
    location: "5th Cross Road, Railway Colony",
    ward: "Ward 5 - West Railway Colony",
    coordinates: { lat: 18.5289, lng: 73.8744 },
    status: "ASSIGNED",
    priority: "HIGH",
    citizenName: "Amit Verma",
    citizenEmail: "amit@example.com",
    citizenPhone: "+91 97112 23344",
    imageUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80",
    workInProgressImageUrl: null,
    completionImageUrl: null,
    assignedWorker: {
      id: "usr_w303",
      name: "Vikram Jadhav",
      phone: "+91 98444 55667",
      trade: "Electrical & Street Lighting"
    },
    createdAt: "2026-11-05T18:00:00Z",
    updatedAt: "2026-11-06T11:30:00Z",
    timeline: [
      { status: "SUBMITTED", timestamp: "2026-11-05T18:00:00Z", note: "Reported.", actor: "Amit Verma" },
      { status: "UNDER_VERIFICATION", timestamp: "2026-11-05T19:15:00Z", note: "Reviewed.", actor: "Desk Officer" },
      { status: "VERIFIED", timestamp: "2026-11-06T09:30:00Z", note: "Electrical hazard verified.", actor: "Priya Deshmukh" },
      { status: "ASSIGNED", timestamp: "2026-11-06T11:30:00Z", note: "Dispatched to lineman Vikram Jadhav.", actor: "Priya Deshmukh" }
    ],
    feedback: null
  },
  {
    id: "CC-2026-0822",
    title: "Stagnant open sewage drain overflowing onto public walkway",
    category: "drainage",
    categoryLabel: "Drainage Issues",
    description: "Stormwater drain blocked by construction debris. Black sewage water overflowing into the residential street, breeding mosquitoes.",
    location: "Lane 3, Heritage Chowk",
    ward: "Ward 6 - Old Heritage City & Chowk",
    coordinates: { lat: 18.5158, lng: 73.8560 },
    status: "SUBMITTED",
    priority: "MEDIUM",
    citizenName: "Kavita Joshi",
    citizenEmail: "kavita@example.com",
    citizenPhone: "+91 99221 14477",
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
    workInProgressImageUrl: null,
    completionImageUrl: null,
    assignedWorker: null,
    createdAt: "2026-11-06T10:15:00Z",
    updatedAt: "2026-11-06T10:15:00Z",
    timeline: [
      { status: "SUBMITTED", timestamp: "2026-11-06T10:15:00Z", note: "Complaint logged by citizen.", actor: "Kavita Joshi" }
    ],
    feedback: null
  },
  {
    id: "CC-2026-0818",
    title: "Public community restroom facility locked and unhygienic",
    category: "sanitation",
    categoryLabel: "Public Sanitation",
    description: "Public toilet block near city bus stand has had no running water for two days and needs deep sanitization and door lock repairs.",
    location: "City Bus Stand Complex, Ward 1",
    ward: "Ward 1 - Central Market & Bus Terminal",
    coordinates: { lat: 18.5255, lng: 73.8612 },
    status: "UNDER_VERIFICATION",
    priority: "MEDIUM",
    citizenName: "Rahul Sharma",
    citizenEmail: "citizen@civicconnect.org",
    citizenPhone: "+91 98765 43210",
    imageUrl: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80",
    workInProgressImageUrl: null,
    completionImageUrl: null,
    assignedWorker: null,
    createdAt: "2026-11-06T12:45:00Z",
    updatedAt: "2026-11-06T13:20:00Z",
    timeline: [
      { status: "SUBMITTED", timestamp: "2026-11-06T12:45:00Z", note: "Submitted by Rahul Sharma.", actor: "Rahul Sharma" },
      { status: "UNDER_VERIFICATION", timestamp: "2026-11-06T13:20:00Z", note: "Sent to health inspection unit.", actor: "Desk Officer" }
    ],
    feedback: null
  }
];

export const MOCK_WORKERS = [
  {
    id: "usr_w301",
    name: "Ramesh Patel",
    email: "worker@civicconnect.org",
    phone: "+91 97222 33445",
    trade: "Roads & Public Infrastructure",
    assignedZone: "Ward 1 & Ward 4 Area",
    activeTasks: 2,
    completedTasks: 48,
    rating: 4.8,
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "usr_w302",
    name: "Suresh Gaikwad",
    email: "suresh.worker@civicconnect.org",
    phone: "+91 98333 44556",
    trade: "Solid Waste & Sanitation",
    assignedZone: "Ward 2 & Ward 6",
    activeTasks: 1,
    completedTasks: 62,
    rating: 4.9,
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "usr_w303",
    name: "Vikram Jadhav",
    email: "vikram.worker@civicconnect.org",
    phone: "+91 98444 55667",
    trade: "Electrical & Street Lighting",
    assignedZone: "Ward 3 & Ward 5",
    activeTasks: 3,
    completedTasks: 35,
    rating: 4.6,
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "usr_w304",
    name: "Anil Kadam",
    email: "anil.worker@civicconnect.org",
    phone: "+91 98555 66778",
    trade: "Water Works & Drainage",
    assignedZone: "Ward 4 & Ward 7",
    activeTasks: 0,
    completedTasks: 51,
    rating: 4.7,
    status: "Available",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"
  }
];

export const MOCK_USERS = [
  {
    id: "usr_c101",
    name: "Rahul Sharma",
    email: "citizen@civicconnect.org",
    phone: "+91 98765 43210",
    role: "citizen",
    address: "Flat 402, Lotus Heights, Ward 4",
    registeredAt: "2026-08-14",
    complaintsFiled: 4,
    status: "Active"
  },
  {
    id: "usr_c102",
    name: "Sunita Roy",
    email: "sunita@example.com",
    phone: "+91 99887 76655",
    role: "citizen",
    address: "Plot 12, Green Park Avenue, Ward 4",
    registeredAt: "2026-09-02",
    complaintsFiled: 2,
    status: "Active"
  },
  {
    id: "usr_c103",
    name: "Amit Verma",
    email: "amit@example.com",
    phone: "+91 97112 23344",
    role: "citizen",
    address: "5th Cross Road, Railway Colony, Ward 5",
    registeredAt: "2026-09-18",
    complaintsFiled: 1,
    status: "Active"
  },
  {
    id: "usr_a201",
    name: "Priya Deshmukh",
    email: "admin@civicconnect.org",
    phone: "+91 98111 22334",
    role: "admin",
    address: "Municipal Corporation HQ, Ward 1",
    registeredAt: "2026-01-10",
    complaintsFiled: 0,
    status: "Active"
  },
  {
    id: "usr_w301",
    name: "Ramesh Patel",
    email: "worker@civicconnect.org",
    phone: "+91 97222 33445",
    role: "worker",
    address: "Municipal Quarters, Ward 1",
    registeredAt: "2026-02-15",
    complaintsFiled: 0,
    status: "Active"
  }
];

export const MOCK_ANALYTICS = {
  monthlyTrends: [
    { month: 'Jun', submitted: 45, resolved: 41 },
    { month: 'Jul', submitted: 58, resolved: 52 },
    { month: 'Aug', submitted: 84, resolved: 76 },
    { month: 'Sep', submitted: 92, resolved: 88 },
    { month: 'Oct', submitted: 110, resolved: 104 },
    { month: 'Nov', submitted: 78, resolved: 65 }
  ],
  categoryBreakdown: [
    { name: 'Roads & Potholes', count: 98, color: '#f59e0b' },
    { name: 'Garbage Collection', count: 84, color: '#10b981' },
    { name: 'Water Leakage', count: 62, color: '#3b82f6' },
    { name: 'Drainage Issues', count: 54, color: '#ef4444' },
    { name: 'Streetlights', count: 46, color: '#eab308' },
    { name: 'Public Sanitation', count: 32, color: '#14b8a6' },
    { name: 'Others', count: 18, color: '#a855f7' }
  ],
  priorityDistribution: [
    { name: 'Urgent', value: 42, color: '#ef4444' },
    { name: 'High', value: 96, color: '#f59e0b' },
    { name: 'Medium', value: 168, color: '#3b82f6' },
    { name: 'Low', value: 88, color: '#64748b' }
  ],
  resolutionPerformance: [
    { department: 'Roads Dept', avgHours: 32, targetHours: 48 },
    { department: 'Waste Dept', avgHours: 18, targetHours: 24 },
    { department: 'Water Board', avgHours: 22, targetHours: 24 },
    { department: 'Electrical', avgHours: 14, targetHours: 24 },
    { department: 'Sanitation', avgHours: 16, targetHours: 18 }
  ]
};

// ==============================================================================
// In-Memory / LocalStorage Mock Service Helpers
// ==============================================================================

const STORAGE_KEY = 'civicconnect_complaints_v1';

export function getStoredComplaints() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COMPLAINTS));
    return INITIAL_COMPLAINTS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_COMPLAINTS;
  }
}

export function saveStoredComplaints(complaints) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
}

export function createMockComplaint(data, user) {
  const complaints = getStoredComplaints();
  const nextNum = complaints.length + 842;
  const newComplaint = {
    id: `CC-2026-${String(nextNum).padStart(4, '0')}`,
    title: data.title,
    category: data.category,
    categoryLabel: data.categoryLabel || data.category,
    description: data.description,
    location: data.location,
    ward: data.ward || 'Ward 1 - Central Market & Bus Terminal',
    coordinates: data.coordinates || { lat: 18.5204, lng: 73.8567 },
    status: 'SUBMITTED',
    priority: data.priority || 'MEDIUM',
    citizenName: user ? user.name : 'Anonymous Citizen',
    citizenEmail: user ? user.email : 'citizen@civicconnect.org',
    citizenPhone: user ? user.phone : '+91 98765 43210',
    imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    workInProgressImageUrl: null,
    completionImageUrl: null,
    assignedWorker: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeline: [
      {
        status: 'SUBMITTED',
        timestamp: new Date().toISOString(),
        note: 'Complaint recorded in CivicConnect portal.',
        actor: user ? `${user.name} (Citizen)` : 'Citizen'
      }
    ],
    feedback: null
  };

  const updated = [newComplaint, ...complaints];
  saveStoredComplaints(updated);
  return newComplaint;
}

export function updateComplaintStatusInStore(complaintId, newStatus, note, actorName, extra = {}) {
  const complaints = getStoredComplaints();
  const index = complaints.findIndex(c => c.id === complaintId);
  if (index === -1) return null;

  const current = complaints[index];
  const newTimelineItem = {
    status: newStatus,
    timestamp: new Date().toISOString(),
    note: note || `Status transitioned to ${newStatus}.`,
    actor: actorName || 'System Admin'
  };

  const updatedComplaint = {
    ...current,
    status: newStatus,
    updatedAt: new Date().toISOString(),
    timeline: [...(current.timeline || []), newTimelineItem],
    ...extra
  };

  complaints[index] = updatedComplaint;
  saveStoredComplaints(complaints);
  return updatedComplaint;
}

export function assignWorkerInStore(complaintId, worker, actorName) {
  return updateComplaintStatusInStore(
    complaintId,
    'ASSIGNED',
    `Task dispatched to field officer ${worker.name}.`,
    actorName,
    { assignedWorker: worker }
  );
}

export function addFeedbackInStore(complaintId, rating, comment) {
  const complaints = getStoredComplaints();
  const index = complaints.findIndex(c => c.id === complaintId);
  if (index === -1) return null;

  const current = complaints[index];
  const feedbackData = {
    rating,
    comment,
    submittedAt: new Date().toISOString()
  };

  const newTimelineItem = {
    status: 'CITIZEN_FEEDBACK',
    timestamp: new Date().toISOString(),
    note: `Citizen rated resolution ${rating} Stars: "${comment}"`,
    actor: current.citizenName
  };

  const updated = {
    ...current,
    status: 'CITIZEN_FEEDBACK',
    feedback: feedbackData,
    timeline: [...(current.timeline || []), newTimelineItem],
    updatedAt: new Date().toISOString()
  };

  complaints[index] = updated;
  saveStoredComplaints(complaints);
  return updated;
}
