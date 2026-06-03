import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'LKR'
  },
  stripePaymentIntentId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Success', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    default: 'Card'
  },
  metadata: {
    type: Object
  }
}, {
  timestamps: true
});

export default mongoose.model('Payment', paymentSchema);