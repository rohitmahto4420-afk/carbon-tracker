const mongoose = require("mongoose");

const MonthlySummarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  month: {
    type: Number,
    required: true // 1-12
  },
  year: {
    type: Number,
    required: true
  },
  total_emission: {
    type: Number,
    default: 0
  },
  previous_month_emission: {
    type: Number,
    default: 0
  },
  target: {
    type: Number,
    default: 25
  }
}, { timestamps: true });

// Ensure unique monthly records per user
MonthlySummarySchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("MonthlySummary", MonthlySummarySchema);
