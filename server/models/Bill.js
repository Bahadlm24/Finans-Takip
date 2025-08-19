const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['electricity', 'water', 'gas', 'internet', 'phone', 'rent', 'insurance', 'other']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  dueDate: {
    type: Date,
    required: true
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  isRecurring: {
    type: Boolean,
    default: true
  },
  recurringDay: {
    type: Number, // Ayın hangi günü (1-31)
    min: 1,
    max: 31
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bill', billSchema);
