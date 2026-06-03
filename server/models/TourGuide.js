import mongoose from 'mongoose';

const tourGuideSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  nic: {
    type: String,
    required: true,
    unique: true
  },
  verificationStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Requested Changes'],
    default: 'Pending'
  },
  yearsOfExperience: {
    type: Number,
    required: true,
    min: 0
  },
  languagesSpoken: [{
    type: String
  }],
  bio: {
    type: String,
    maxlength: 500
  },
  pricing: {
    priceModel: {
      type: String,
      enum: ['PerHour'], // Strict Hourly Rate only as per new/trust requirements
      required: true,
      default: 'PerHour'
    },
    rate: {
      type: Number,
      required: true,
      min: 0
    }
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' }
  },
  specializations: [{
    type: String
  }],
  documents: [{
    documentType: { type: String, enum: ['License', 'NIC', 'PoliceClearance', 'FirstAidCert'] },
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: false }
}, {
  timestamps: true
});
tourGuideSchema.index({ location: '2dsphere' });

export default mongoose.model('TourGuide', tourGuideSchema);