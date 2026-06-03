import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  senderRole: { type: String, enum: ['User', 'Support', 'Administrator'] },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const supportTicketSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ticketNumber: {
    type: String,
    required: true,
    unique: true
  },
  subject: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Booking', 'Payment', 'Account', 'Technical', 'Other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Open', 'InProgress', 'Waiting', 'Resolved', 'Closed'],
    default: 'Open'
  },
  messages: [messageSchema],
  lastReplyAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('SupportTicket', supportTicketSchema);