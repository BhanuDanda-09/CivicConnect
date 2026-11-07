// ==============================================================================
// Complaint Model (Mongoose Schema)
// ==============================================================================

const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters long'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Detailed description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'pothole',
          'garbage',
          'water_leakage',
          'drainage',
          'street_light',
          'sanitation',
          'other',
          'ROADS_AND_POTHOLES',
          'GARBAGE_COLLECTION',
          'WATER_LEAKAGE',
          'DRAINAGE',
          'STREETLIGHTS',
          'PUBLIC_SANITATION',
          'OTHER'
        ],
        message: '{VALUE} is not a recognized civic category',
      },
      index: true,
    },
    categoryLabel: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      required: [true, 'Location address is required'],
      trim: true,
    },
    latitude: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90'],
      default: 18.5204, // Default city center
    },
    longitude: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180'],
      default: 73.8567, // Default city center
    },
    ward: {
      type: String,
      required: [true, 'Municipal ward is required'],
      trim: true,
      index: true,
    },
    landmark: {
      type: String,
      trim: true,
      default: '',
    },
    priority: {
      type: String,
      enum: {
        values: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
        message: '{VALUE} is not a valid priority level',
      },
      default: 'MEDIUM',
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: [
          'SUBMITTED',
          'UNDER_VERIFICATION',
          'VERIFIED',
          'ASSIGNED',
          'IN_PROGRESS',
          'RESOLVED',
          'CITIZEN_FEEDBACK',
          'REJECTED',
        ],
        message: '{VALUE} is not a valid complaint status',
      },
      default: 'SUBMITTED',
      index: true,
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Citizen reference is required'],
      index: true,
    },
    assignedWorker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    images: {
      type: [String],
      default: [],
    },
    resolutionImages: {
      type: [String],
      default: [],
    },
    rejectionReason: {
      type: String,
      default: '',
      trim: true,
    },
    feedback: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feedback',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Static generator helper for standard CivicConnect ID format: CC-YYYY-XXXX
complaintSchema.statics.generateComplaintId = async function () {
  const currentYear = new Date().getFullYear();
  try {
    if (mongoose.connection.readyState === 1) {
      const count = await this.countDocuments();
      const serial = String(count + 1).padStart(4, '0');
      return `CC-${currentYear}-${serial}`;
    }
  } catch (e) {
    // Fallback if DB query fails
  }
  const randomSerial = String(Math.floor(1000 + Math.random() * 9000));
  return `CC-${currentYear}-${randomSerial}`;
};

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
