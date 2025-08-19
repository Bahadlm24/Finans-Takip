const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: [
      'food', 'transport', 'shopping', 'entertainment', 
      'health', 'education', 'clothing', 'gifts', 
      'travel', 'other'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'other'],
    default: 'cash'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);
