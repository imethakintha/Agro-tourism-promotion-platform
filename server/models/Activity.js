import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  farmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ActivityCategory', required: true },
  tagIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ActivityTag' }],
  
  // Hybrid Model: Custom details
  customTitle: { type: String, required: true, maxlength: 200 },
  customDescription: { type: String, required: true, maxlength: 2000 },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Draft'],
    default: 'Active'
  },
  
  // Logistics
  pricePerPerson: { type: Number, required: true, min: 0 },
  durationHours: { type: Number, required: true, min: 0.5 },
  maxParticipants: { type: Number, required: true, min: 1 },
  minParticipants: { type: Number, default: 1, min: 1 },
  difficulty: {
    type: String,
    enum: ['Easy', 'Moderate', 'Challenging'],
    default: 'Easy'
  },
  
  // Media & Info
  images: [{
    url: String,
    isPrimary: { type: Boolean, default: false },
    caption: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  includedItems: [String],
  whatToBring: [String],
  
  // Availability
  availabilityCalendar: [{
    date: { type: Date, required: true },
    timeSlots: [{
      startTime: String, // "09:00"
      endTime: String, // "12:00"
      availableSlots: Number,
      bookedSlots: { type: Number, default: 0 },
      status: {
        type: String,
        enum: ['Available', 'Full', 'Unavailable'],
        default: 'Available'
      }
    }]
  }],
  
  // Stats
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Add indexes for efficient searching and filtering
activitySchema.index({ customTitle: 'text', customDescription: 'text' });
activitySchema.index({ pricePerPerson: 1 });
activitySchema.index({ averageRating: -1 });
activitySchema.index({ farmId: 1 });
activitySchema.index({ categoryId: 1 });

export default mongoose.model('Activity', activitySchema);