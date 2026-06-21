const mongoose = require('mongoose');

const daySessionSchema = new mongoose.Schema({
  attendant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  openingBalance: {
    type: Number,
    required: true,
    min: 0,
  },
}, { timestamps: true });

daySessionSchema.index({ attendant: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DaySession', daySessionSchema);
