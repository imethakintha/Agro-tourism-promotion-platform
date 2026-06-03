import mongoose from 'mongoose';

const verificationLogSchema = new mongoose.Schema({
  providerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  providerType: {
    type: String,
    enum: ['Farmer', 'TourGuide', 'TransportProvider'],
    required: true
  },
  adminUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['Approved', 'Rejected', 'Requested Changes'],
    required: true
  },
  comments: {
    type: String,
    maxlength: 1000
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('VerificationLog', verificationLogSchema);