// ==============================================================================
// User Model (Mongoose Schema)
// ==============================================================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const ROLES = {
  CITIZEN: 'citizen',
  ADMIN: 'admin',
  WORKER: 'worker',
};

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [3, 'Full name must be at least 3 characters long'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Excluded from default Mongoose queries
    },
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    ward: {
      type: String,
      default: 'Ward 1 - Central Market & Bus Terminal',
      trim: true,
    },
    trade: {
      type: String,
      default: 'Roads & Public Infrastructure',
      trim: true,
    },
    role: {
      type: String,
      enum: {
        values: ['citizen', 'admin', 'worker', 'CITIZEN', 'ADMIN', 'WORKER'],
        message: '{VALUE} is not a valid user role',
      },
      default: 'citizen',
      lowercase: true, // Standardize to lowercase ('citizen', 'admin', 'worker')
      index: true,
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: Hash password with bcryptjs (salt rounds = 12) before saving to MongoDB
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method: Compare plain-text password with stored bcrypt hash
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method: Generate signed JWT authentication token
userSchema.methods.generateAuthToken = function () {
  const payload = {
    id: this._id,
    role: this.role,
    email: this.email,
  };

  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_civicconnect_change_in_production';
  const expiresIn = process.env.JWT_EXPIRES_IN || process.env.JWT_EXPIRE || '1d';

  return jwt.sign(payload, secret, { expiresIn });
};

// Sanitize user object for JSON serialization (never leaks password or __v)
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

userSchema.statics.ROLES = ROLES;

const User = mongoose.model('User', userSchema);

module.exports = User;
