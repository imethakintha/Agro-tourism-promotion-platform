import mongoose from 'mongoose';

const farmSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmName: {
    type: String,
    required: true
  },
  farmType: {
    type: String,
    enum: ['Spice Garden', 'Tea Plantation', 'Paddy Field', 'Fruit Orchard', 'Vegetable Farm', 'Organic Farm', 'Mixed Farm', 'Other'],
    required: true
  },
  verificationStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Requested Changes'],
    default: 'Pending'
  },
  description: {
    type: String,
    maxlength: 1000
  },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  facilities: [{
    type: String,
    enum: ['Parking', 'Restrooms', 'Dining Area', 'Accommodation', 'First Aid', 'WiFi', 'Wheelchair Accessible', 'Pet Friendly']
  }],
  images: [{
    url: String,
    isPrimary: { type: Boolean, default: false },
    caption: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  documents: [{
    documentType: { type: String, enum: ['NIC', 'LandOwnership', 'BusinessRegistration'] },
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: false }
}, {
  timestamps: true
});
farmSchema.index({ location: '2dsphere' });

export default mongoose.model('Farm', farmSchema);