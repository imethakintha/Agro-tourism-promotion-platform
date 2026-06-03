import mongoose from 'mongoose';

const activityTagSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ActivityCategory',
    required: true
  },
  tagName: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('ActivityTag', activityTagSchema);