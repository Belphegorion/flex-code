import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    address: String,
    lat: Number,
    lng: Number
  },
  dateStart: {
    type: Date,
    required: true
  },
  dateEnd: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value > this.dateStart;
      },
      message: 'End date must be after start date'
    }
  },
  ticketImage: {
    url: String,
    publicId: String
  },
  videoCallActive: {
    type: Boolean,
    default: false
  },
  videoCallId: String,
  qrCode: String,
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  tickets: {
    totalDispersed: { type: Number, default: 0, min: 0 },
    totalSold: { 
      type: Number, 
      default: 0, 
      min: 0,
      validate: {
        validator: function(value) {
          return value <= this.tickets.totalDispersed;
        },
        message: 'Tickets sold cannot exceed total dispersed'
      }
    },
    pricePerTicket: { type: Number, default: 0, min: 0 }
  },
  expenses: [{
    category: String,
    description: String,
    amount: Number,
    date: { type: Date, default: Date.now }
  }],
  estimatedExpenses: [{
    category: String,
    description: String,
    estimatedAmount: Number
  }],

  revenue: { type: Number, default: 0 },
  estimatedProfit: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.model('Event', eventSchema);
