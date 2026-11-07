// ==============================================================================
// CivicConnect Platform Constants & Configurations
// ==============================================================================

export const APP_NAME = "CivicConnect";
export const APP_TAGLINE = "Report. Track. Resolve. Build a Better Community.";

export const USER_ROLES = {
  CITIZEN: 'citizen',
  ADMIN: 'admin',
  WORKER: 'worker',
};

export const COMPLAINT_CATEGORIES = [
  { id: 'pothole', label: 'Road and Potholes', icon: 'Hammer', color: 'amber', description: 'Cracks, deep potholes, asphalt degradation, road cave-ins' },
  { id: 'garbage', label: 'Garbage Collection', icon: 'Trash2', color: 'emerald', description: 'Overflowing dumpsters, uncollected curbside waste, illegal dumping' },
  { id: 'water_leakage', label: 'Water Leakage', icon: 'Droplets', color: 'blue', description: 'Burst main pipelines, leaking fire hydrants, municipal water loss' },
  { id: 'drainage', label: 'Drainage Issues', icon: 'Waves', color: 'rose', description: 'Blocked stormwater drains, sewage backup, stagnant dirty water' },
  { id: 'street_light', label: 'Streetlight Problems', icon: 'Lightbulb', color: 'yellow', description: 'Flickering or broken light poles, dark streets, exposed wiring' },
  { id: 'sanitation', label: 'Public Sanitation', icon: 'Sparkles', color: 'teal', description: 'Public toilet cleanliness, open defecation, market hygiene' },
  { id: 'other', label: 'Other Civic Infrastructure', icon: 'HelpCircle', color: 'purple', description: 'Damaged footpaths, broken traffic signals, illegal encroachments' },
];

export const COMPLAINT_STATUS = {
  SUBMITTED: {
    key: 'SUBMITTED',
    label: 'Submitted',
    color: 'bg-slate-100 text-slate-700 border-slate-300',
    step: 1,
    description: 'Complaint recorded and awaiting municipal desk verification.'
  },
  UNDER_VERIFICATION: {
    key: 'UNDER_VERIFICATION',
    label: 'Under Verification',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    step: 2,
    description: 'Municipal desk reviewing report details, location, and photos.'
  },
  VERIFIED: {
    key: 'VERIFIED',
    label: 'Verified',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    step: 3,
    description: 'Complaint verified and approved for municipal department assignment.'
  },
  ASSIGNED: {
    key: 'ASSIGNED',
    label: 'Assigned',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    step: 4,
    description: 'Assigned to field municipal worker for on-site inspection and action.'
  },
  IN_PROGRESS: {
    key: 'IN_PROGRESS',
    label: 'In Progress',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    step: 5,
    description: 'Field team is on site actively executing repairs or cleaning.'
  },
  RESOLVED: {
    key: 'RESOLVED',
    label: 'Resolved',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    step: 6,
    description: 'Work completed on site with photographic proof uploaded.'
  },
  CITIZEN_FEEDBACK: {
    key: 'CITIZEN_FEEDBACK',
    label: 'Closed with Feedback',
    color: 'bg-teal-100 text-teal-800 border-teal-300',
    step: 7,
    description: 'Citizen acknowledged resolution and submitted a satisfaction rating.'
  },
  REJECTED: {
    key: 'REJECTED',
    label: 'Rejected',
    color: 'bg-rose-100 text-rose-800 border-rose-300',
    step: -1,
    description: 'Marked invalid, duplicate, or out of municipal jurisdiction.'
  }
};

export const PRIORITY_LEVELS = {
  LOW: { label: 'Low', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  MEDIUM: { label: 'Medium', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  HIGH: { label: 'High', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  URGENT: { label: 'Urgent', color: 'bg-rose-100 text-rose-800 border-rose-300 font-semibold' },
};

export const CITY_WARDS = [
  'Ward 1 - Central Market & Bus Terminal',
  'Ward 2 - Shivaji Nagar North',
  'Ward 3 - East Industrial Belt & Ring Road',
  'Ward 4 - South Green Park & Lake View',
  'Ward 5 - West Railway Colony',
  'Ward 6 - Old Heritage City & Chowk',
  'Ward 7 - Tech City & University Campus',
  'Ward 8 - Gandhi Nagar Extension',
];

export const DEMO_USERS = {
  citizen: {
    id: 'usr_c101',
    name: 'Rahul Sharma',
    email: 'citizen@civicconnect.org',
    role: 'citizen',
    phone: '+91 98765 43210',
    address: 'Flat 402, Lotus Heights, Ward 4 - South Green Park',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
  },
  admin: {
    id: 'usr_a201',
    name: 'Priya Deshmukh',
    email: 'admin@civicconnect.org',
    role: 'admin',
    department: 'Municipal Corporation Head Office',
    phone: '+91 98111 22334',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'
  },
  worker: {
    id: 'usr_w301',
    name: 'Ramesh Patel',
    email: 'worker@civicconnect.org',
    role: 'worker',
    trade: 'Roads & Public Infrastructure',
    phone: '+91 97222 33445',
    zone: 'Ward 1 & Ward 4 Area',
    avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=150&q=80'
  }
};
