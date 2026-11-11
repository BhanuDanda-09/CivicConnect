// ==============================================================================
// Civic Infrastructure Asset Model (Asset.js)
// Enables QR-based asset identification, public infrastructure registry,
// and recurring maintenance correlation
// ==============================================================================

const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    assetId: {
      type: String,
      required: [true, 'Asset ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Asset category is required'],
      enum: [
        'STREETLIGHT',
        'WASTE_BIN',
        'WATER_PUMP',
        'DRAINAGE_MANHOLE',
        'ROAD_SEGMENT',
        'PUBLIC_TOILET',
        'TRAFFIC_SIGNAL',
        'OTHER',
      ],
      index: true,
    },
    ward: {
      type: String,
      required: [true, 'Municipal ward is required'],
      trim: true,
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Location description is required'],
      trim: true,
    },
    country: {
      type: String,
      default: 'India',
      trim: true,
    },
    state: {
      type: String,
      default: 'Telangana',
      trim: true,
    },
    district: {
      type: String,
      default: 'Hyderabad',
      trim: true,
    },
    city: {
      type: String,
      default: 'Hyderabad',
      trim: true,
    },
    pincode: {
      type: String,
      default: '',
      trim: true,
    },
    latitude: {
      type: Number,
      default: 17.3850,
    },
    longitude: {
      type: Number,
      default: 78.4867,
    },
    locationGeo: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [78.4867, 17.3850],
      },
    },
    status: {
      type: String,
      enum: ['OPERATIONAL', 'MAINTENANCE_REQUIRED', 'UNDER_REPAIR', 'DECOMMISSIONED'],
      default: 'OPERATIONAL',
      index: true,
    },
    installedAt: {
      type: Date,
      default: Date.now,
    },
    lastInspectedAt: {
      type: Date,
      default: Date.now,
    },
    maintenanceCount: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    relatedComplaints: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Complaint',
      },
    ],
  },
  {
    timestamps: true,
  }
);

assetSchema.index({ locationGeo: '2dsphere' });

assetSchema.pre('save', function (next) {
  if (this.longitude !== undefined && this.latitude !== undefined) {
    this.locationGeo = {
      type: 'Point',
      coordinates: [Number(this.longitude), Number(this.latitude)],
    };
  }
  next();
});

const Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset;

