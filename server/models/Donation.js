// server/models/Donation.js
const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    amount: { type: Number, required: true, min: 1 },
    paymentId: { type: String }, // mock or Stripe/Razorpay transaction ID
  },
  { timestamps: true }
);

module.exports = mongoose.model('Donation', donationSchema);
