const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number, required: true },
    donatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const campaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, enum: ['Medical', 'Education'], required: true },
    goalAmount: { type: Number, required: true },
    raisedAmount: { type: Number, default: 0 },
    documents: [{ type: String }], // <-- Stores uploaded file paths
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    donors: [donorSchema],
    status: { type: String, enum: ['Active', 'Completed', 'Rejected'], default: 'Active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Campaign', campaignSchema);
