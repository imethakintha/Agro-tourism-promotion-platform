import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['Booking', 'ServiceRequest', 'System', 'Payment'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedEntityId: { type: mongoose.Schema.Types.ObjectId }, // e.g. bookingId
  actionUrl: { type: String },
  isRead: { type: Boolean, default: false },
  priority: {
      type: String,
      enum: ['Normal', 'High', 'Urgent'],
      default: 'Normal'
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Notification', notificationSchema);