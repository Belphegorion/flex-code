import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  skills: [{
    type: String,
    required: true
  }],
  bio: {
    type: String,
    maxlength: 500
  },
  portfolioLinks: [{
    type: String
  }],
  videoIntroUrl: {
    type: String
  },
  documents: [{
    name: String,
    url: String,
    uploadedAt: Date
  }],
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    lat: Number,
    lng: Number
  },
  availability: {
    type: String,
    enum: ['full-time', 'part-time', 'weekends', 'flexible'],
    default: 'flexible'
  },
  availabilityWindows: [{
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6
    },
    startTime: String,
    endTime: String
  }],
  hourlyRate: {
    type: Number,
    min: 0
  },
  experience: {
    type: String
  }
}, {
  timestamps: true
});

// Index for skill-based searches
profileSchema.index({ skills: 1 });
profileSchema.index({ 'location.lat': 1, 'location.lng': 1 });

export default mongoose.model('Profile', profileSchema);