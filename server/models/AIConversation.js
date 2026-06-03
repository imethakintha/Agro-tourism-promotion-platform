import mongoose from 'mongoose';

const aiConversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['PlantIdentification', 'ChatBot'],
    default: 'PlantIdentification'
  },
  // For Plant ID
  imageUrl: {
    type: String,
    required: function() { return this.type === 'PlantIdentification'; }
  },
  identifiedPlant: {
    type: String
  },
  aiResponseRaw: {
    type: Object
  },
  // For ChatBot
  sessionId: {
    type: String
  },
  context: {
    activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity' },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }
  },
  messages: [{
    role: { type: String, enum: ['user', 'assistant', 'system'] },
    content: String,
    timestamp: { type: Date, default: Date.now }
  }],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('AIConversation', aiConversationSchema);