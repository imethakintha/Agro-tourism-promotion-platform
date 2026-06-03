import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userRole: {
    type: String,
    enum: ['Farmer', 'TourGuide', 'TransportProvider'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  payoutPeriod: {
    startDate: Date,
    endDate: Date
  },
  bookingIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }],
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Processing', 'Completed', 'Failed'],
    default: 'Pending'
  },
  breakdown: {
    totalEarnings: Number,
    platformCommission: Number,
    netAmount: Number
  },
  transactionId: String,
  processedAt: Date
}, {
  timestamps: true
});

export default mongoose.model('Payout', payoutSchema);