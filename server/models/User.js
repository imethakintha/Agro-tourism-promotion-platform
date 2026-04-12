import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 8,
    select: false
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  role: {
    type: String,
    enum: ['Tourist', 'Farmer', 'TourGuide', 'TransportProvider', 'Administrator'],
    required: true
  },
  profilePic: {
    type: String,
    default: null
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  }],
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: null
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  accountStatus: {
    type: String,
    enum: ['Active', 'Suspended', 'Deleted'],
    default: 'Active'
  },
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  accountLockedUntil: {
    type: Date,
    default: null
  },
  countryOfResidence: {
    type: String,
    default: 'Sri Lanka'
  },
  preferredLanguage: {
    type: String,
    enum: ['English', 'Tamil', 'French', 'German', 'Chinese', 'Russian', 'Spanish', 'Arabic', 'Japanese', 'Italian', 'Portuguese', 'Hindi', 'Dutch', 'Korean', 'Bengali'],
    default: 'English'
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);