import mongoose from 'mongoose';

const activityCategorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  },
  icon: {
    type: String
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('ActivityCategory', activityCategorySchema);