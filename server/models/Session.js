import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  refreshToken: {
    type: String,
    unique: true
  },
  deviceInfo: {
    deviceType: String,
    browser: String,
    os: String,
    ipAddress: String
  },
  location: {
    country: String,
    city: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Session', sessionSchema);