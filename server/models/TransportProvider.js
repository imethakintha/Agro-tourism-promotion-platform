import mongoose from 'mongoose';

const transportProviderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ['Car', 'Van', 'Bus', 'Tuk-Tuk', 'SUV', 'Mini-Bus']
  },
  vehicleRegistrationNo: {
    type: String,
    required: true,
    unique: true
  },
  verificationStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Requested Changes'],
    default: 'Pending'
  },
  maxPassengers: {
    type: Number,
    required: true,
    min: 1
  },
  vehicleMake: String,
  vehicleModel: String,
  vehicleYear: Number,
  pricePerKm: {
    type: Number,
    required: true,
    min: 0
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  amenities: [{
    type: String,
    enum: ['AC', 'WiFi', 'Music System', 'Child Seat', 'Wheelchair Accessible']
  }],
  documents: [{
    documentType: { type: String, enum: ['DrivingLicense', 'VehicleRegistration', 'Insurance', 'RevenueLicense', 'NIC'] },
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' } 
  },
  serviceRadius: { type: Number, default: 10 },
  isActive: { type: Boolean, default: false }
}, {
  timestamps: true
});
transportProviderSchema.index({ location: '2dsphere' });

export default mongoose.model('TransportProvider', transportProviderSchema);