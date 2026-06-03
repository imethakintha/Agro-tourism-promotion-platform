import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  touristId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: true
  },
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true
  },
  // Optional services
  guideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TourGuide',
    default: null
  },
  transportProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TransportProvider',
    default: null
  },

  // Service Statuses
  guideStatus: {
    type: String,
    enum: ['NotRequested', 'Pending', 'Confirmed', 'Declined'],
    default: 'NotRequested'
  },
  transportStatus: {
    type: String,
    enum: ['NotRequested', 'Pending', 'Confirmed', 'Declined'],
    default: 'NotRequested'
  },

  // Broadcast Info
  guideBroadcastSentAt: Date,
  guideBroadcastTimeoutAt: Date,
  transportBroadcastSentAt: Date,
  transportBroadcastTimeoutAt: Date,

  // Location Details
  pickupLocation: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  dropoffLocation: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },

  bookingDate: {
    type: Date,
    default: Date.now
  },
  activityDate: {
    type: Date,
    required: true
  },
  activityTime: {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  },
  numberOfParticipants: {
    type: Number,
    required: true,
    min: 1
  },
  participantDetails: [{
    name: String,
    age: Number,
    specialRequirements: String
  }],
  contactName: { type: String, required: true },
  contactPhone: { type: String, required: true },

  pricing: {
    activityCost: { type: Number, required: true },
    guideCost: { type: Number, default: 0 },
    transportCost: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    promotionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion' },
    totalCost: { type: Number, required: true },
    currency: { type: String, default: 'LKR' }
  },

  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Declined', 'Refunded'],
    default: 'Pending'
  },

  cancellation: {
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    cancelledAt: Date
  },

  reviewSubmitted: { type: Boolean, default: false },

  farmerPayoutStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Paid'],
    default: 'Pending'
  },
  guidePayoutStatus: {
    type: String,
    enum: ['NotApplicable', 'Pending', 'Processing', 'Paid'],
    default: 'NotApplicable' // Guide කෙනෙක් නැත්නම් NotApplicable වෙනවා
  },
  transportPayoutStatus: {
    type: String,
    enum: ['NotApplicable', 'Pending', 'Processing', 'Paid'],
    default: 'NotApplicable' // Transport නැත්නම් NotApplicable වෙනවා
  }
}, {
  timestamps: true
});

bookingSchema.pre('save', function (next) {
  if (!this.guideId) {
    this.guidePayoutStatus = 'NotApplicable';
  } else if (this.guidePayoutStatus === 'NotApplicable') {
    this.guidePayoutStatus = 'Pending';
  }

  if (!this.transportProviderId) {
    this.transportPayoutStatus = 'NotApplicable';
  } else if (this.transportPayoutStatus === 'NotApplicable') {
    this.transportPayoutStatus = 'Pending';
  }
  next();
});

export default mongoose.model('Booking', bookingSchema);