import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType' 
  },
  targetType: {
    type: String,
    required: true,
    enum: ['Activity', 'TourGuide', 'TransportProvider']
  },
  ratings: {
    overall: { type: Number, required: true, min: 1, max: 5 },
    authenticity: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 },
    service: { type: Number, min: 1, max: 5 }
  },
  comment: {
    type: String,
    maxlength: 500
  },
  images: [{
    url: String,
    caption: String
  }],
  moderationStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  response: {
    text: String,
    respondedAt: Date
  }
}, {
  timestamps: true
});

export default mongoose.model('Review', reviewSchema);