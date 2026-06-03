import mongoose from 'mongoose';

const systemLogSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['INFO', 'WARN', 'ERROR'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  stack: {
    type: String
  },
  metadata: {
    type: Object
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('SystemLog', systemLogSchema);