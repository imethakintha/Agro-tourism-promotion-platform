import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  category: {
    type: String,
    enum: ['General', 'Bug', 'Complaint', 'Suggestion'],
    default: 'General'
  },
  status: {
    type: String,
    enum: ['New', 'Read', 'Replied', 'Closed'],
    default: 'New'
  },
  adminNote: String
}, {
  timestamps: true
});

export default mongoose.model('Feedback', feedbackSchema);