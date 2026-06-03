import mongoose from 'mongoose';

const refundSchema = new mongoose.Schema({
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    enum: ['CustomerRequest', 'ProviderCancellation', 'Weather', 'SystemError', 'Other'],
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Processed', 'Failed'],
    default: 'Pending'
  },
  refundTransactionId: String
}, {
  timestamps: true
});

export default mongoose.model('Refund', refundSchema);